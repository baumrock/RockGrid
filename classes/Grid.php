<?php

namespace RockGrid;

use ProcessWire\Wire;

class Grid extends Wire
{
  public $buttonsRight;
  public $buttonsLeft;
  public $cssFile;
  public $jsFile;
  public $phpFile;

  public function buildUI(): void
  {
  }

  public function getData()
  {
    // return false indicates that no getData() method is implemented
    // in the extending grid
    return false;
  }

  public function __debugInfo()
  {
    return [
      'phpFile' => $this->phpFile,
      'jsFile' => $this->jsFile,
      'cssFile' => $this->cssFile,
    ];
  }
}
