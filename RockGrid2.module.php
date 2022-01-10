<?php namespace ProcessWire;
/**
 * RockGrid Main Module
 *
 * @author Bernhard Baumrock, 19.02.2021
 * @license COMMERCIAL DO NOT DISTRIBUTE
 * @link https://www.baumrock.com
 */
class RockGrid2 extends WireData implements Module, ConfigurableModule {

  public $assetsDir;
  public $path; // path to module

  private $dirs = []; // additional grid dirs to scan for files
  private $grids = []; // grid cache
  private $loadAssets = false;

  public static function getModuleInfo() {
    return [
      'title' => 'RockGrid2',
      'version' => '0.0.1',
      'summary' => 'RockGrid2 Main Module',
      'autoload' => true,
      'singular' => true,
      'icon' => 'table',
      'requires' => [],
      'installs' => [
        'InputfieldRockGrid2',
      ],
    ];
  }

  public function init() {
    $this->wire('rockgrid2', $this);
    $this->path = $this->wire->config->paths($this);
    $this->autoloader();
    $this->loadAssets();
    $this->createAssetsFolder();
    $this->handleAjax();
  }

  /**
   * Add dir to array of scanned directories
   * Usage: $modules->get('RockGrid2')->addDir(/my/module/grids);
   * @return void
   */
  public function addDir($dir) {
    $dir = Paths::normalizeSeparators(rtrim($dir,"/")."/");
    $this->dirs[] = $dir;
  }

  /**
   * Add stylesheet to assets
   */
  public function addStylesheet() {
    $config = $this->wire->config;
    // If debug is true and RockLESS is installed this will auto-generate
    // the css stylesheet that will be used on production.
    $less = $this->wire->modules->isInstalled("RockLESS");
    if($config->debug AND $less AND $this->wire->user->isSuperuser()) {
      /** @var RockLESS $less */
      $less = $this->wire('modules')->get('RockLESS');
      $less->saveCSS(__DIR__."/RockGrid2.css", __DIR__."/RockGrid2.less", [
        'parserOptions' => ['compress'=>true],
      ]);
    }
    $config->styles->add($this->m("RockGrid2.css"));
  }

  /**
   * Register classes folder for autoloading
   * @return void
   */
  public function autoloader() {
    spl_autoload_register(function($class) {
      if(strpos($class, "RockGrid2") !== 0) return;
      $name = str_replace("RockGrid2\\", "", $class);
      require_once(__DIR__."/classes/$name.php");
    });
  }

  /**
   * Create assets folder
   * @return void
   */
  public function createAssetsFolder() {
    $this->assetsDir = $this->wire->config->paths->assets.$this->className()."/";
    if(!is_dir($this->assetsDir)) $this->wire->files->mkdir($this->assetsDir);
  }

  /**
   * Create JS file for this grid if it does not exist
   * This helps on setting up new grids :)
   * @return void
   */
  public function createJS($inputfield) {
    $file = $inputfield->getFile();
    $grid = $this->getGrid($inputfield);
    $base = substr($file, 0, -4);
    if(!$base) return;
    $js = "$base.js";
    if(is_file($js)) return;
    $stub = $this->wire->files->fileGetContents(__DIR__."/stubs/grid.js");
    $content = str_replace("{grid}", $grid->name, $stub);
    $this->wire->files->filePutContents($js, $content);
    return $js;
  }

  /**
   * Return path of file that sets up this grid
   * @return string
   */
  public function getFile($file, $ext = 'php') {
    // is it already a file? then return it!
    if(is_file($file)) return $file;

    foreach($this->getPossibleFilenames($file, $ext) as $f) {
      if(is_file($f)) return $f;
    }

    return false;
  }

  /**
   * Load grid instance
   * @return Grid|false
   */
  public function getGrid($data) {
    if($data instanceof InputfieldRockGrid2) $data = $data->grid;
    $file = $this->getFile($data);
    if(!is_file($file)) return false;
    require_once($file);
    $name = pathinfo($file, PATHINFO_FILENAME);

    // try to get grid from cache
    if(array_key_exists($name, $this->grids)) return $this->grids[$name];

    // grid is not in cache, so we create it and trigger the "load" event
    // this is done only once for each grid!
    $class = "\RockGrid2\\".$name;
    $grid = new $class();
    $grid->load();

    // save to cache and return grid
    return $this->grids[$name] = $grid;
  }

  /**
   * Return all possible filenames for this grid
   * @return array
   */
  public function getPossibleFilenames($file, $ext = 'php') {
    $arr = [];

    // first, try the assets folder
    // then add all dirs that where added via $rg->addDir(...);
    $arr[] = $this->assetsDir.$file.".$ext";
    foreach($this->dirs as $dir) $arr[] = $dir.$file.".$ext";

    return $arr;
  }

  /**
   * Add hook to handle AJAX requests of grids
   * @return void
   */
  public function handleAjax() {
    // hook for grid data
    $this->addHook('/rockgrid2/{grid}', function($event) {
      $grid = $this->getGrid($event->grid);
      if(!$grid) throw new Wire404Exception("Grid not found");

      // ACCESS CONTROL
      if(!$grid->isViewable()) {
        return json_encode(['error' => "<strong>Error</strong><br>"
          ."You don't have access to view data of grid '$this'"]);
      }

      if($this->wire->config->ajax) $grid->sendJSON();
      else $event->return = $grid->debug();
    });
    $this->addHook('/rockgrid2/{grid}/cc/{callback}', function($event) {
      $grid = $this->getGrid($event->grid);
      if(!$grid) throw new Wire404Exception("Grid not found");

      // ACCESS CONTROL
      if(!$grid->isViewable()) {
        return json_encode(['error' => "<strong>Error</strong><br>"
          ."You don't have access to view data of grid '$this'"]);
      }

      $callback = $grid->getCallbacks($event->callback);
      if(!$callback) throw new WireException("Callback not found");
      if(!$this->wire->config->ajax) throw new WireException("Not allowed");

      // execute callback
      $data = file_get_contents('php://input');
      $data = json_decode($data, TRUE);
      $input = $this->wire(new WireData()); /** @var WireData $input */
      $input->setArray($data);
      $result = $callback->__invoke($input, $grid);

      return json_encode($result);
    });
  }

  /**
   * Load tabulator assets
   * This is hookable so that you can customize the loaded scripts/styles
   * if you need.
   * @return void
   */
  public function ___loadAssets() {
    $rg = $this;

    // add the grid's js file on renderready
    $this->addHookAfter("InputfieldRockGrid2::renderReadyHook", function(HookEvent $event) use($rg) {
      // set flag to load assets for rockgrid
      $rg->loadAssets = true;
      $inputfield = $event->object;
      $js = $inputfield->getFile('js');
      if(!$js) $js = $this->createJS($inputfield);
      $this->wire->config->scripts->add($rg->m($js));
    });

    // if any rockgrid field is present we add the necessary libraries
    // this is done AFTER all field's scripts are loaded so that the first
    // init() call of RockGrid2.js fires for all grids but all files are
    // still only loaded once
    $this->addHookBefore('AdminTheme::getExtraMarkup', function (HookEvent $event) use($rg) {
      if(!$rg->loadAssets) return;
      $config = $this->wire->config;

      // load moment
      $config->scripts->add($rg->m("lib/moment.min.js"));
      if($rg->momentTZ) {
        $config->scripts->add($rg->m("lib/moment-timezone-with-data.min.js"));
      }

      // tabulator
      $config->scripts->add($rg->m("tabulator/js/tabulator.min.js"));
      $config->styles->add($rg->m("tabulator/css/tabulator.min.css"));

      // rockgrid
      $config->scripts->add($rg->m("Grid.js"));
      $config->scripts->add($rg->m("RockGrid2.js"));
      $rg->addStylesheet();

      // load exceljs and filesaver.js
      if($rg->loadXLS) {
        $config->scripts->add($rg->m("lib/exceljs.min.js"));
        $config->scripts->add($rg->m("lib/FileSaver.min.js"));
      }
    });
  }

  /**
   * Return url including timestamp (cache buster)
   * @return string
   */
  public function m($file) {
    $config = $this->wire->config;
    if(!is_file($file)) $file = $config->paths($this).$file;
    $m = "?m=".filemtime($file);
    return str_replace($config->paths->root, $config->urls->root, $file).$m;
  }

  /**
   * Return url of given file
   * @return string
   */
  public function url($path) {
    $config = $this->wire->config;
    return str_replace($config->paths->root, $config->urls->root, $path);
  }

  /**
  * Config inputfields
  * @param InputfieldWrapper $inputfields
  */
  public function getModuleConfigInputfields($inputfields) {
    return $inputfields;
  }
}
