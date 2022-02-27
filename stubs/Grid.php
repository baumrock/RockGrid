<?php namespace RockGrid2;
class {name} extends Grid {

  public function info() {
    return parent::info()->setArray([
      'title' => '{name} Grid',
      'icon' => 'check',
    ]);
  }

  public function getButtonsCenter() {
    return parent::getButtonsCenter();
  }

  public function getButtonsLeft() {
    return parent::getButtonsLeft();
  }

  public function getData() {
    // we use findRaw in this example because it is shipped with the core
    // my recommendation is to use RockFinder3 as it provides a lot more
    // and customized options for working with PW page data in grids
    $data = $this->findRaw("id>0, limit=50, sort=-id", [
      'id',
      'title',
    ]);
    return $data;
  }

  public function isViewable() {
    return false;
  }

}
