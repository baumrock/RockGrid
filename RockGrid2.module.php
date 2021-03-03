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
   * Find file from given data object
   * @return WireData
   */
  public function getFile($data) {
    $file = $this->assetsDir."ImportInvoices.php";
    $data = $this->wire(new WireData()); /** @var WireData $data */
    $data->path = $file;
    $data->name = pathinfo($file, PATHINFO_FILENAME);
    return $data;
  }

  /**
   * Load tabulator assets
   * This is hookable so that you can customize the loaded scripts/styles
   * if you need.
   * @return void
   */
  public function ___loadAssets() {
    $this->wire->config->scripts->add(__DIR__."/tabulator/js/tabulator.min.js");
    $this->wire->config->styles->add(__DIR__."/tabulator/css/tabulator.min.css");
  }

  /**
   * Load grid
   * @return Grid|false
   */
  public function loadGrid($data) {
    $file = $this->getFile($data);
    require_once($file->path);
    $class = "\RockGrid2\\".$file->name;
    return new $class();
  }

  /**
  * Config inputfields
  * @param InputfieldWrapper $inputfields
  */
  public function getModuleConfigInputfields($inputfields) {
    return $inputfields;
  }
}
