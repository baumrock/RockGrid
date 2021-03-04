<?php namespace RockGrid2;

use ProcessWire\Paths;
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
   * Set path to file of this grid
   * @return void
   */
  public function setFile() {
    $class = new ReflectionClass($this);
    $this->file = Paths::normalizeSeparators($class->getFilename());
  }
}
