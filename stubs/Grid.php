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

  public function getData() {}

  public function isVisible() {
    return false;
  }

}
