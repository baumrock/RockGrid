<?php

namespace ProcessWire;

/**
 * Clone Item
 */

$id = wire()->input->post('id', 'int');
$page = wire()->pages->get($id);
if (!$page instanceof Page) throw new WireException("Invalid page");
if (!$page->editable()) throw new WireException("Page is not editable");

$clone = wire()->pages->clone($page);
$clone->save();

return [
  'success' => true,
  'message' => "Page $page cloned to $clone",
];
