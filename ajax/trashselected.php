<?php

namespace ProcessWire;

/**
 * Trash selected rows
 */

$selected = wire()->input->post('selected', 'intArray');
// bd($selected);

foreach ($selected as $id) {
  $page = wire()->pages->get($id);
  if (!$page->trashable()) throw new WireException("Page $page not trashable");
  $page->trash();
}

return [
  'success' => true,
  'message' => 'pages trashed',
];
