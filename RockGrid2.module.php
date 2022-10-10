<?php

namespace ProcessWire;

/**
 * @author Bernhard Baumrock, 19.02.2021
 * @license COMMERCIAL DO NOT DISTRIBUTE
 * @link https://www.baumrock.com
 */
class RockGrid extends WireData implements Module
{

  public $assetsDir;
  public $path; // path to module

  private $dirs = []; // additional grid dirs to scan for files
  private $grids = []; // grid cache
  public $gridsAll = []; // grids that are setup in grid dirs
  private $loadAssets = false;

  public static function getModuleInfo()
  {
    return [
      'title' => 'RockGrid',
      'version' => '1.1.1',
      'summary' => 'RockGrid Main Module',
      'autoload' => true, // necessary for url hooks
      'singular' => true,
      'icon' => 'table',
      'requires' => [],
      'installs' => [
        'InputfieldRockGrid',
        'FieldtypeRockGrid',
        'ProcessRockGrid',
      ],
    ];
  }

  public function init()
  {
    $this->wire('rockgrid2', $this);
    $this->path = $this->wire->config->paths($this);
    $this->autoloader();
    $this->loadAssets();
    $this->createAssetsFolder();
    $this->handleAjax();
    $this->addDir($this->wire->config->paths->assets . "RockGrid");

    // attach hooks
    $this->addHookAfter("/rockgrid2/jump/{pageID}", $this, "jumpToPage");

    // hooks to enable dynamic menu items
    // ingenuity by RobinS https://bit.ly/35gf4Fj
    $this->addHookBefore('ProcessController::execute', $this, 'beforeProcessController');
    $this->addHookAfter('AdminThemeFramework::getPrimaryNavArray', $this, 'afterPrimaryNavArray');
  }

  public function ready()
  {
    $this->findGrids();
  }

  /**
   * Add dir to array of scanned directories
   * Usage: $modules->get('RockGrid')->addDir(/my/module/grids);
   * @return void
   */
  public function addDir($dir)
  {
    $dir = Paths::normalizeSeparators(rtrim($dir, "/") . "/");
    $this->dirs[] = $dir;
  }

  /**
   * Add stylesheet to assets
   */
  public function addStylesheet()
  {
    $config = $this->wire->config;
    // If debug is true and RockLESS is installed this will auto-generate
    // the css stylesheet that will be used on production.
    $less = $this->wire->modules->isInstalled("RockLESS");
    if ($config->debug and $less and $this->wire->user->isSuperuser()) {
      /** @var RockLESS $less */
      $less = $this->wire('modules')->get('RockLESS');
      $less->saveCSS(__DIR__ . "/RockGrid.css", __DIR__ . "/RockGrid.less", [
        'parserOptions' => ['compress' => true],
      ]);
    }
    $config->styles->add($this->m("RockGrid.css"));
  }

  /**
   * After AdminThemeFramework::getPrimaryNavArray
   */
  protected function afterPrimaryNavArray(HookEvent $event)
  {
    $items = $event->return;
    $url = rtrim($this->wire->pages->get(2)->url, "/");
    foreach ($items as $i => $item) {
      if ($item['name'] === 'grids') {
        $url = $item['url'];

        // setup children
        $children = [];
        foreach ($this->gridsAll as $name => $grid) {
          $children[] = [
            'id' => null,
            'parent_id' => null,
            'name' => null,
            'title' => $grid['title'],
            'url' => $url . "?grid=$name",
            'children' => [],
            'icon' => $grid['icon'],
            'navJSON' => false,
          ];
        }

        // add new grid
        if ($this->wire->user->isSuperuser()) {
          $children[] = [
            'id' => null,
            'parent_id' => null,
            'name' => null,
            'title' => 'Create New Grid',
            'url' => $url . "new",
            'children' => [],
            'icon' => 'plus',
            'navJSON' => false,
          ];
        }

        $items[$i]['children'] = $children;
      }
    }
    $event->return = $items;
  }

  /**
   * Register classes folder for autoloading
   * @return void
   */
  public function autoloader()
  {
    spl_autoload_register(function ($class) {
      if (strpos($class, "RockGrid") !== 0) return;
      $name = str_replace("RockGrid\\", "", $class);
      require_once(__DIR__ . "/classes/$name.php");
    });
  }

  /**
   * Before ProcessController::execute
   */
  protected function beforeProcessController(HookEvent $event)
  {
    // Prevent admin menus from being cached
    $this->wire()->session->removeFor('AdminThemeUikit', 'prnav');
    $this->wire()->session->removeFor('AdminThemeUikit', 'sidenav');
  }

  /**
   * Create assets folder
   * @return void
   */
  public function createAssetsFolder()
  {
    $this->assetsDir = $this->wire->config->paths->assets . $this->className() . "/";
    if (!is_dir($this->assetsDir)) $this->wire->files->mkdir($this->assetsDir);
  }

  /**
   * Create JS file for this grid if it does not exist
   * This helps on setting up new grids :)
   * @return void
   */
  public function createJS($inputfield)
  {
    $file = $inputfield->getFile();
    $grid = $this->getGrid($inputfield);
    $base = substr($file, 0, -4);
    if (!$base) return;
    $js = "$base.js";
    if (is_file($js)) return;
    $stub = $this->wire->files->fileGetContents(__DIR__ . "/stubs/grid.js");
    $content = str_replace("{grid}", $grid->name, $stub);
    $this->wire->files->filePutContents($js, $content);
    return $js;
  }

  /**
   * Find all grid files
   * @return array
   */
  public function findGrids()
  {
    if ($this->gridsAll) return $this->gridsAll;
    $grids = [];
    $opt = ['extensions' => ['php']];
    foreach ($this->dirs as $dir) {
      foreach ($this->wire->files->find($dir, $opt) as $file) {
        $name = pathinfo($file, PATHINFO_FILENAME);
        $class = "\\RockGrid\\$name";
        require_once($file);
        $tmp = new $class();
        $grids[$name] = [
          'title' => $tmp->info()->title,
          'icon' => $tmp->info()->icon,
          'file' => $file,
        ];
      }
    }
    return $this->gridsAll = $grids;
  }

  /**
   * Get data array from findRaw
   *
   * This converts a regular $pages->findRaw() result into a format
   * that RockGrid can handle.
   *
   * Note that the second parameter must be an array. This makes sure that
   * the result has all specified columns in the results array.
   *
   * @return array
   */
  public function findRaw($selector, array $fields)
  {
    $raw = $this->wire->pages->findRaw($selector, $fields);
    // bdb($raw, "raw");

    // prepare keys that we need in the results
    $keys = [];
    foreach ($fields as $k => $v) $keys[$v] = '';
    // db($keys, 'keys');

    // create array of objects
    $array = array_values(array_map(function ($item) use ($keys) {
      return (object)array_merge($keys, $item);
    }, $raw));

    return $array;
  }

  /**
   * Return path of file that sets up this grid
   * @return string
   */
  public function getFile($file, $ext = 'php')
  {
    // is it already a file? then return it!
    if (is_file($file)) return $file;
    foreach ($this->getPossibleFilenames($file, $ext) as $f) {
      if (is_file($f)) return $f;
    }
    return false;
  }

  /**
   * Load grid instance
   * @return Grid|false
   */
  public function getGrid($data)
  {
    if ($data instanceof InputfieldRockGrid) $data = $data->grid;
    $file = $this->getFile($data);
    if (!is_file($file)) return false;
    require_once($file);
    $name = pathinfo($file, PATHINFO_FILENAME);

    // try to get grid from cache
    if (array_key_exists($name, $this->grids)) return $this->grids[$name];

    // grid is not in cache, so we create it and trigger the "load" event
    // this is done only once for each grid!
    $class = "\RockGrid\\" . $name;
    $grid = new $class();
    $grid->load();

    // save to cache and return grid
    return $this->grids[$name] = $grid;
  }

  /**
   * Return all possible filenames for this grid
   * @return array
   */
  public function getPossibleFilenames($file, $ext = 'php')
  {
    $arr = [];
    foreach ($this->dirs as $dir) $arr[] = $dir . $file . ".$ext";
    return $arr;
  }

  /**
   * Add hook to handle AJAX requests of grids
   * @return void
   */
  public function handleAjax()
  {
    // hook for grid data
    // this hook is used either in the debugger using GET
    // or for the grid's ajax request to fetch data via POST
    $this->addHook('/rockgrid2/{grid}', function ($event) {
      $grid = $this->getGrid($event->grid);
      if (!$grid) throw new Wire404Exception("Grid not found");

      // ACCESS CONTROL
      if (!$grid->isViewable()) {
        $hint = "<br>Add an isViewable() method to your grid.";
        if (!$this->wire->user->isSuperuser()) $hint = '';
        return json_encode(['error' => "<strong>Error</strong><br>"
          . "You don't have access to view data of grid $grid.$hint"]);
      }

      if ($this->wire->config->ajax) $grid->sendJSON();
      else $event->return = $grid->debug();
    });
    $this->addHook('/rockgrid2/{grid}/ajax/{callback}', function ($event) {
      $grid = $this->getGrid($event->grid);
      if (!$grid) throw new Wire404Exception("Grid not found");

      // ACCESS CONTROL
      if (!$grid->isViewable()) {
        return json_encode(['error' => "<strong>Error</strong><br>"
          . "You don't have access to view data of grid '$this'"]);
      }

      $callback = $grid->getCallbacks($event->callback);
      if (!$callback) throw new WireException("Callback not found");
      if (!$this->wire->config->ajax) throw new WireException("Not allowed");

      // execute callback
      $data = file_get_contents('php://input');
      $data = json_decode($data, TRUE);
      $input = $this->wire(new WireData());
      /** @var WireData $input */
      $input->setArray($data);
      $result = $callback->__invoke($input, $grid);

      return json_encode($result);
    });
    $this->addHook('/rockgrid2/{grid}/sse/{callback}', function ($event) {
      $grid = $this->getGrid($event->grid);
      if (!$grid) throw new Wire404Exception("Grid not found");

      // ACCESS CONTROL
      if (!$grid->isViewable()) {
        return json_encode(['error' => "<strong>Error</strong><br>"
          . "You don't have access to view data of grid '$this'"]);
      }

      // payload key
      $sessionkey = "sse-{$event->grid}-{$event->callback}";

      if ($this->wire->config->ajax) {
        // ajax request with payload
        $data = file_get_contents('php://input');
        $this->wire->session->set($sessionkey, $data);
        return json_encode([
          'succes' => true,
        ]);
      }

      // send response
      header("Cache-Control: no-cache");
      header("Content-Type: text/event-stream");

      $callback = $grid->getCallbacks($event->callback);
      if (!$callback) throw new WireException("Callback not found");

      // execute callback
      $input = json_decode($this->wire->session->get($sessionkey));
      $callback->__invoke($input, $grid);
      if (connection_aborted()) return 'aborted';
      return 'success';
    });
  }

  /**
   * Jump to page via id
   * @return void
   */
  public function jumpToPage(HookEvent $event)
  {
    if (!$this->wire->user->isLoggedin()) return;
    if (!$id = (int)$event->pageID) return;
    if (!$page = $this->wire->pages->get($id) or !$page->id) return;
    if (!$page->viewable()) return;
    $this->wire->session->redirect($page->url);
  }

  /**
   * Load tabulator assets
   * This is hookable so that you can customize the loaded scripts/styles
   * if you need.
   * @return void
   */
  public function ___loadAssets()
  {
    $rg = $this;

    // add the grid's js file on renderready
    $this->addHookAfter("InputfieldRockGrid::renderReadyHook", function (HookEvent $event) use ($rg) {
      // set flag to load assets for rockgrid
      $rg->loadAssets = true;
      $inputfield = $event->object;
      $js = $inputfield->getFile('js');
      if (!$js) $js = $this->createJS($inputfield);
      $this->wire->config->scripts->add($rg->m($js));
    });

    // if any rockgrid field is present we add the necessary libraries
    // this is done AFTER all field's scripts are loaded so that the first
    // init() call of RockGrid.js fires for all grids but all files are
    // still only loaded once
    $this->addHookBefore('AdminTheme::getExtraMarkup', function (HookEvent $event) use ($rg) {
      if (!$rg->loadAssets) return;
      $config = $this->wire->config;

      // load moment
      $config->scripts->add($rg->m("lib/moment.min.js"));
      if ($rg->momentTZ) {
        $config->scripts->add($rg->m("lib/moment-timezone-with-data.min.js"));
      }

      // tabulator
      $config->scripts->add($rg->m("tabulator/js/tabulator.min.js"));
      $config->styles->add($rg->m("tabulator/css/tabulator.min.css"));

      // rockgrid
      $config->scripts->add($rg->m("Grid.js"));
      $config->scripts->add($rg->m("RockGrid.js"));
      $rg->addStylesheet();

      // load exceljs and filesaver.js
      if ($rg->loadXLS) {
        $config->scripts->add($rg->m("lib/exceljs.min.js"));
        $config->scripts->add($rg->m("lib/FileSaver.min.js"));
      }
    });
  }

  /**
   * Return url including timestamp (cache buster)
   * @return string
   */
  public function m($file)
  {
    if (!$file) return;
    $config = $this->wire->config;
    if (!is_file($file)) $file = $config->paths($this) . $file;
    $m = "?m=" . filemtime($file);
    return str_replace($config->paths->root, $config->urls->root, $file) . $m;
  }

  /**
   * Return url of given file
   * @return string
   */
  public function url($path)
  {
    $config = $this->wire->config;
    return str_replace($config->paths->root, $config->urls->root, $path);
  }
}
