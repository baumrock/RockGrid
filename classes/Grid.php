<?php

namespace RockGrid;

use ProcessWire\Wire;

class Grid extends Wire
{
  public $cssFile;
  public $jsFile;
  public $phpFile;

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
