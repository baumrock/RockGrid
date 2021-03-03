<?php namespace RockGrid2;

use ProcessWire\Inputfield;
use ProcessWire\Wire;

/**
 * Base class for all RockGrids
 */
class Grid extends Wire {

  /**
   * Render this grid
   * @return string
   */
  public function render() {
    return $this->className();
  }
}
