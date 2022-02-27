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
    $data = $this->findRaw("id>0, limit=5", [
      'id',
      'title',
    ]);
    return $data;
  }

  public function isViewable() {
    return false;
  }

}
