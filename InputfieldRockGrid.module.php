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
   * Render the Inputfield
   * @return string
   */
  public function ___render()
  {
    $textarea = parent::___render();
    // $textarea = str_replace('></', 'hidden></', $textarea);

    $gridMarkup = $this->wire->files->render(
      __DIR__ . '/layouts/default.php',
      [
        'grid' => rockgrid()->getGrid($this),
        'textarea' => $this->id,
      ]
    );

    $gridMarkup .= "<script>new RockGrid('#{$this->id}')</script>";

    // textarea first so that it exists in JS init() call
    // then the grid
    return $textarea . $gridMarkup;
  }

  public function ___renderValue()
  {
    return $this->___render();
  }

  public function renderReady(Inputfield $parent = null, $renderValueMode = false)
  {
    $grid = rockgrid()->getGrid($this);

    // load all dependencies
    $this->wire->config->scripts->add(
      rockgrid()->url(__DIR__ . '/RockGrid.js', true)
    );
    $this->wire->config->scripts->add(
      rockgrid()->url(__DIR__ . '/lib/tabulator.min.js', true)
    );
    $this->wire->config->styles->add(
      rockgrid()->url(__DIR__ . '/lib/tabulator.min.css', true)
    );

    // load grid's js and css files
    $this->wire->config->scripts->add(
      rockgrid()->url($grid->jsFile, true)
    );
    if ($grid->cssFile) {
      $this->wire->config->styles->add(
        rockgrid()->url($grid->cssFile, true)
      );
    }

    return parent::renderReady($parent, $renderValueMode);
  }
}
