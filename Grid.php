<?php namespace RockGrid2;

use ProcessWire\Paths;
use ProcessWire\RockFinder3;
use ProcessWire\Wire;
use ReflectionClass;

/**
 * Base class for all RockGrids
 */
class Grid extends Wire {

  public $file;
  public $id;
  public $name;

  public function __construct() {
    parent::__construct();
    $this->name = $this->className(); // unique name of grid
    $this->id = "rg2-".$this->className(); // id of dom element
    $this->setFile();
  }

  /**
   * Dump data of grid to tracy console
   * Useful for development
   * Usage: $modules->get('RockGrid2')->getGrid('FooGrid')->dump();
   */
  public function dump() {
    $data = $this->getData();
    if(!$data instanceof RockFinder3) return "Can only dump RockFinder3 data!";
    $data->dump();
  }

  /**
   * Get data of this grid
   * This method should be overridden by grids extending this class
   * @return array|RockFinder3
   */
  public function getData() {
    return [];
  }

  /**
   * Get data as JSON
   * @return string
   */
  public function getJSON() {
    $data = $this->getData();
    if($data instanceof RockFinder3) return $data->getJSON();
    return json_encode($data);
  }

  /**
   * Render this grid
   * @return string
   */
  public function ___render() {
    return "<div class='RockGrid2' id='{$this->id}'>
        <div class='rg-header'></div>
        <div class='rg-grid'></div>
        <div class='rg-footer'></div>
      </div>
      <script>RockGrid2.init('{$this->name}');</script>";
  }

  /**
   * Send JSON
   * todo: add check for valid json https://stackoverflow.com/a/35391449/6370411
   * @return void
   */
  public function sendJSON($gzip = true) {
    $json = $this->getJSON();
    http_response_code(200);
    header('Content-Type: application/json');
    if($gzip) ini_set("zlib.output_compression", 1);
    die($json);
  }

  /**
   * Set path to file of this grid
   * @return void
   */
  public function setFile() {
    $class = new ReflectionClass($this);
    $this->file = Paths::normalizeSeparators($class->getFilename());
  }

  public function __debugInfo() {
    return [
      'getData()' => $this->getData(),
    ];
  }
}
