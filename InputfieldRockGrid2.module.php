<?php namespace ProcessWire;

use RockGrid2\Grid;

/**
 * RockGrid Inputfield using tabulator.info
 *
 * @author Bernhard Baumrock, 19.02.2021
 * @license COMMERCIAL DO NOT DISTRIBUTE
 * @link https://www.baumrock.com
 */
class InputfieldRockGrid2 extends InputfieldTextarea {

  public static function getModuleInfo() {
    return [
      'title' => 'RockGrid2 Inputfield',
      'version' => '0.0.1',
      'summary' => 'RockGrid Inputfield using tabulator.info',
      'icon' => 'table',
      'requires' => [
        'RockGrid2',
      ],
      'installs' => [],
    ];
  }

  /**
   * Get file path for given grid
   * @return string
   */
  public function getFile($ext = "php") {
    return $this->main()->getFile($this->grid, $ext);
  }

  /**
   * Get main module instance
   * @return RockGrid2
   */
  public function main() {
    return $this->wire->modules->get('RockGrid2');
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
    $grid = $this->main()->getGrid($this);
    if(!$grid) {
      $file = $this->getFile();
      if(!$file) return "No file for this grid";
      return "File $file not found";
    }
    return $grid->render();
  }
}
