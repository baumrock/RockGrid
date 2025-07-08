<?php

namespace RockGrid;

use ProcessWire\Page;
use ProcessWire\Wire;

class Grid extends Wire
{
  public $buttonsRight;
  public $buttonsLeft;
  public $cssFile;
  public $jsFile;
  public $name;
  public $phpFile;

  public function addToPageList(Page $page)
  {
    return false;
  }

  public function buildUI(): void {}

  public function getData()
  {
    // return false indicates that no getData() method is implemented
    // in the extending grid
    return false;
  }

  /**
   * Send data to the grid's js file
   *
   * Example:
   *
   * PHP file:
   * return [
   *   'foo' => 'baz',
   * ];
   *
   * JS file:
   * grid.jsVars.foo
   *
   * @return array
   */
  public function getJsVars(): array
  {
    return [];
  }

  public function __debugInfo()
  {
    return [
      'name' => $this->name,
      'phpFile' => $this->phpFile,
      'jsFile' => $this->jsFile,
      'cssFile' => $this->cssFile,
      'jsVars' => $this->getJsVars(),
    ];
  }
}
