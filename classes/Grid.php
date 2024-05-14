<?php

namespace RockGrid;

use ProcessWire\Wire;

class Grid extends Wire
{
  public $cssFile;
  public $jsFile;
  public $phpFile;

  public function __debugInfo()
  {
    return [
      'phpFile' => $this->phpFile,
      'jsFile' => $this->jsFile,
      'cssFile' => $this->cssFile,
    ];
  }
}
