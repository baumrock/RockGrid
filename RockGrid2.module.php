<?php namespace ProcessWire;
/**
 * RockGrid Main Module
 *
 * @author Bernhard Baumrock, 19.02.2021
 * @license COMMERCIAL DO NOT DISTRIBUTE
 * @link https://www.baumrock.com
 */
require_once("Grid.php");
class RockGrid2 extends WireData implements Module, ConfigurableModule {

  public $assetsDir;

  private $loadAssets = false;

  public static function getModuleInfo() {
    return [
      'title' => 'RockGrid2',
      'version' => '0.0.1',
      'summary' => 'RockGrid2 Main Module',
      'autoload' => "template=admin",
      'singular' => true,
      'icon' => 'table',
      'requires' => [],
      'installs' => [
        'InputfieldRockGrid2',
      ],
    ];
  }

  public function init() {
    $this->loadAssets();
    $this->createAssetsFolder();
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
      $js = $this->url($inputfield->getFile('js'));
      if($js) $this->wire->config->scripts->add($js);
    });

    // if any rockgrid field is present we add the necessary libraries
    // this is done AFTER all field's scripts are loaded so that the first
    // init() call of RockGrid2.js fires for all grids but all files are
    // still only loaded once
    $this->addHookBefore('AdminTheme::getExtraMarkup', function (HookEvent $event) use($rg) {
      if(!$rg->loadAssets) return;
      $config = $this->wire->config;
      $url = $config->urls($rg);
      $config->scripts->add($url."lib/moment.min.js");
      $config->scripts->add($url."tabulator/js/tabulator.min.js");
      $config->scripts->add($url."Grid.js");
      $config->scripts->add($url."RockGrid2.js");
      $config->styles->add($url."tabulator/css/tabulator.min.css");
    });
  }

  /**
   * Load grid
   * @return Grid|false
   */
  public function loadGrid($inputfield) {
    $file = $inputfield->getFile();
    if(!is_file($file)) return false;
    require_once($file);
    $name = pathinfo($file, PATHINFO_FILENAME);
    $class = "\RockGrid2\\".$name;
    return new $class();
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
