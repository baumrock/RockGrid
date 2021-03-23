<?php namespace RockGrid2;

use ProcessWire\Paths;
use ProcessWire\RockFinder3;
use ProcessWire\Wire;
use ReflectionClass;

/**
 * Base class for all RockGrids
 */
class Grid extends Wire {

  public $admin; // url to admin
  public $file;
  public $id;
  public $name;

  public function __construct() {
    parent::__construct();
    $this->admin = $this->wire->pages->get(2)->url;
    $this->name = $this->className(); // unique name of grid
    $this->id = "rg2-".$this->className(); // id of dom element
    $this->rg2 = $this->wire->modules->get('RockGrid2');
    $this->setFile();
  }

  /**
   * This method is called when a grid is loaded the very first time
   * This is only called when a grid is loaded so it is not the right place
   * for attaching hooks like you'd to in init()
   */
  public function load() {}

  /**
   * Render debug tabulator
   * @return string
   */
  public function debug() {
    // prepare data
    $data = $this->getData();
    if($data instanceof RockFinder3) $data = $data->getRowArray();
    return $this->wire->files->render($this->rg2->path."debug.php", [
      'rg' => $this->rg2,
      'data' => $this->getJSON($data),
    ]);
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
   * Get default buttons for this grid
   * @return Buttons
   */
  public function getButtons() {
    $buttons = $this->wire(new Buttons());
    $buttons->add([
      'name' => 'nofilter',
      'icon' => 'times',
      'tooltip' => 'Reset all filters',
      'hidden' => true,
    ]);
    $buttons->add([
      'name' => 'reload',
      'icon' => 'refresh',
      'tooltip' => 'Reload data',
    ]);
    return $buttons;
  }

  /**
   * Get default left buttons for this grid
   * @return Buttons
   */
  public function getButtonsLeft() {
    $buttons = $this->wire(new Buttons());
    return $buttons;
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
   * Get data as JSON ready to send to the user
   * This is the place wher ACCESS CONTROL happens!
   * @return string
   */
  public function getJSON($data = null) {
    // get data of this grid
    // this can be a plain php array
    if(!$data) $data = $this->getData();

    // if data is a RockFinder3 we get the JSON
    // holding additional info like relations and options
    if($data instanceof RockFinder3) $data = $data->getJSON(true);

    // ACCESS CONTROL
    // TODO: let the grid define access
    if(!$this->wire->user->isSuperuser()) {
      $data = ['error' => 'no access'];
    }

    // return json
    if(is_string($data)) return $data;
    return json_encode($data);
  }

  /**
   * Render this grid
   * @return string
   */
  public function ___render() {
    $file = $this->rg2->path."layouts/default.php";
    return $this->wire->files->render($file, ['grid' => $this])
      ."<script>RockGrid2.init('{$this->name}');</script>";
  }

  /**
   * Send JSON
   * // TODO: add check for valid json
   * https://stackoverflow.com/a/35391449/6370411
   * @return void
   */
  public function sendJSON($gzip = true) {
    $json = $this->getJSON();
    http_response_code(200);
    if($this->wire->config->ajax) {
      header('Content-Type: application/json');
      if($gzip) ini_set("zlib.output_compression", 1);
      die($json);
    }
    return $json;
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
