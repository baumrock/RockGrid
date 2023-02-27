<?php

namespace RockGrid;

class {name} extends Grid
{

  public function info()
  {
    return parent::info()->setArray([
      'title' => 'Grid {name}',
      'icon' => 'check',
      'help' => true, // you can remove this after setup
      'stub' => '{js}', // you can remove this after setup
    ]);
  }

  public function getButtons()
  {
    // add or modify buttons at the top right of the grid
    return parent::getButtons();
  }

  public function getButtonsCenter()
  {
    // add or modify buttons at the top center of the grid
    return parent::getButtonsCenter();
  }

  public function getButtonsLeft()
  {
    // add or modify buttons at the top left of the grid
    return parent::getButtonsLeft();
  }

  public function getData()
  {
    // we use findRaw in this example because it is shipped with the core
    // my recommendation is to use RockFinder3 as it provides a lot more
    // and customized options for working with PW page data in grids
    $data = $this->findRaw("id>0, limit=50, sort=-id", [
      'id',
      'title',
      'created',
      'modified',
    ]);
    return $data;
  }

  /**
   * This method defines who can view the grid
   * By default only superusers can view data. Adjust this to your needs.
   * @return bool
   */
  public function isViewable()
  {
    if ($this->wire->user->isSuperuser()) return true;
    // if($this->wire->user->hasRole('foo')) return true;
    return false;
  }
}
