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
    return $this->main()->getFile($this->grid, $ext);
  }

  /**
   * Get main module instance
   * @return RockGrid
   */
  public function main()
  {
    return $this->wire->modules->get('RockGrid');
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
      $out = "<div>";
      $grid = $this->main()->getGrid($this);
      $grid->setAjaxParams($this->ajaxParams);
      if (!$grid) {
        $file = $this->getFile();
        if (!$file) {
          $out .= "<strong>No file for this grid found!</strong> Tried these...";
          foreach ($this->main()->getPossibleFilenames($this->grid) as $f) {
            $out .= "<div>$f</div>";
          }
          return $out;
        }
        return "File $file not found";
      }
      $out .= "</div>";
      return $grid->render();
    } catch (\Throwable $th) {
      if ($this->wire->user->isSuperuser()) return $th->getMessage();
      else return "Error rendering grid";
    }
  }

  public function ___renderValue()
  {
    return $this->___render();
  }
}
