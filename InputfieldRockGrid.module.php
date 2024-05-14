<?php

namespace ProcessWire;

/**
 * RockGrid Inputfield using tabulator.info
 *
 * @author Bernhard Baumrock, 19.02.2021
 * @license COMMERCIAL DO NOT DISTRIBUTE
 * @link https://www.baumrock.com
 */
class InputfieldRockGrid extends InputfieldTextarea
{

  public $ajaxParams;

  public static function getModuleInfo()
  {
    return [
      'title' => 'RockGrid Inputfield',
      'version' => json_decode(file_get_contents(__DIR__ . "/package.json"))->version,
      'summary' => 'Inputfield for RockGrid Data Listings.',
      'icon' => 'table',
      'requires' => [
        'RockGrid',
      ],
      'installs' => [],
    ];
  }

  /**
   * Get file path for given grid
   * @return string
   */
  public function getFile($ext = "php")
  {
    return rockgrid()->getFile($this->grid, $ext);
  }

  /**
   * Process the Inputfield's input
   * @return $this
   */
  public function ___processInput($input)
  {
    return false;
  }

  /**
   * Render the Inputfield
   * @return string
   */
  public function ___render()
  {
    // output must be wrapped in a div to make ajax inputfields work!
    try {
      $grid = rockgrid()->getGrid($this);
      return $grid->phpFile;
    } catch (\Throwable $th) {
      $this->log($th->getMessage());
      if ($this->wire->user->isSuperuser()) return $th->getMessage();
      else return "Error rendering grid";
    }
  }

  public function ___renderValue()
  {
    return $this->___render();
  }

  public function renderReady(Inputfield $parent = null, $renderValueMode = false)
  {
    $grid = rockgrid()->getGrid($this);
    if ($grid->cssFile) {
      $this->wire->config->styles->add(
        rockgrid()->url($grid->cssFile, true)
      );
    }
    return parent::renderReady($parent, $renderValueMode);
  }
}
