<?php namespace ProcessWire;

use RockGrid\Grid;

/**
 * RockGrid Inputfield using tabulator.info
 *
 * @author Bernhard Baumrock, 19.02.2021
 * @license COMMERCIAL DO NOT DISTRIBUTE
 * @link https://www.baumrock.com
 */
class InputfieldRockGrid extends InputfieldTextarea {

  public static function getModuleInfo() {
    return [
      'title' => 'RockGrid Inputfield',
      'version' => '0.0.1',
      'summary' => 'RockGrid Inputfield using tabulator.info',
      'icon' => 'table',
      'requires' => [],
      'installs' => [],
    ];
  }

  /**
   * Get main module instance
   * @return RockGrid
   */
  public function main() {
    return $this->wire->modules->get('RockGrid');
  }

  /**
  * Process the Inputfield's input
  * @return $this
  */
  public function ___processInput($input) {
    $this->message('process input!');
    return false;
  }

  /**
  * Render the Inputfield
  * @return string
  */
  public function ___render() {
    $grid = $this->main()->loadGrid($this);
    return $grid->render();
  }
}
