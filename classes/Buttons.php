<?php namespace RockGrid2;
class Buttons extends \ProcessWire\WireArray {

  /**
   * Add a button to this array
   * @return Button
   */
  public function add($data) {
    $button = $this->wire(new Button());
    $button->id = uniqid();
    $button->small = true;
    $button->secondary = true;
    $button->addClass('rg-button ui-button');
    foreach($data as $k=>$v) {
      if($k == 'tooltip') $button->attr('uk-tooltip', $v);
      if($k == 'href') $button->attr('href', $v); // href quickfix
      if($k == 'hidden') $button->attr('style', 'display:none'); // initially hide button
      $button->set($k, $v);
    }
    parent::add($button);
    return $button;
  }

  /**
   * Get a new/blank item of the type that this WireArray holds
   * @throws WireException If class doesn't implement this method.
   * @return Wire|null
   */
  public function makeBlankItem() {
    return $this->wire(new Button());
  }

  /**
   * Render all buttons
   * @return string
   */
  public function render() {
    $buttons = '';
    foreach($this as $button) $buttons .= $button->render();
    return "<div class='rg-buttons'>$buttons</div>";
  }

}
