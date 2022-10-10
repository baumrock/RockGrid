<?php

namespace RockGrid;

use ProcessWire\WireData;
use ProcessWire\WireException;

class Buttons extends \ProcessWire\WireArray
{

  /**
   * Add a button to this array
   * @return Button
   */
  public function add($data, $prepend = false)
  {
    $button = $this->wire(new Button());
    $button->id = uniqid();
    $button->small = true;
    $button->secondary = true;
    $button->addClass('rg-button ui-button');
    foreach ($data as $k => $v) {
      if ($k == 'tooltip') $button->attr('uk-tooltip', $v);
      elseif ($k == 'href') $button->attr('href', $v); // href quickfix

      /**
       * The hidden attribute can have the following values
       * selected -> hide button when rows are selected
       * !selected -> hide button when no rows are selected
       */
      elseif ($k == 'hidden') {
        $button->attr('data-hidden', $v);
        if ($v === '!selected' or $v === true) {
          $button->attr('style', 'display:none'); // initially hide button
        }
      }

      // ajax buttons with callback
      elseif ($k == 'callback') {
        // get callback name (used to access callback)
        $callbackname = @$data['callback']['name'] ?: @$data['name'];
        if (!$callbackname) throw new WireException("No callback name found");

        $cb = $this->wire(new WireData());
        /** @var WireData $cb */
        $cb->setArray($v);
        $button->attr('data-callback', $callbackname);
        $button->attr('data-confirm', $cb->confirm);
        $button->attr('data-confirmmarkup', $cb->confirmmarkup);
        $button->attr('data-loading', $cb->loading ?: 'loading...');
        $button->attr('data-reload', $cb->reload ? 1 : 0);
      }

      // set property everytime!
      // this is important to access callback from php
      $button->set($k, $v);
    }
    if ($prepend) parent::prepend($button);
    else parent::add($button);
    return $button;
  }

  /**
   * Add buttons to this buttons array
   * @return self
   */
  public function addButtons($buttons)
  {
    foreach ($buttons as $b) parent::add($b);
    return $this;
  }

  /**
   * Get a new/blank item of the type that this WireArray holds
   * @throws WireException If class doesn't implement this method.
   * @return Wire|null
   */
  public function makeBlankItem()
  {
    return $this->wire(new Button());
  }

  /**
   * Prepend a new button
   * @return Button
   */
  public function prepend($data)
  {
    return $this->add($data, true);
  }

  /**
   * Render all buttons
   * @return string
   */
  public function render($align = 'rg-buttons-right')
  {
    $buttons = '';
    foreach ($this as $button) $buttons .= $button->render();
    return "<div class='rg-buttons $align'>$buttons</div>";
  }
}
