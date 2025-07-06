<?php

namespace RockGrid;

trait Formatters
{

  /**
   * Flatten an array that we get from a findRaw call so that we can use it
   * for a RockGrid column.
   */
  public static function flatten($data, $prop = 'title'): string
  {
    if (!is_array($data)) return '';
    return $data[0][$prop] ?? '';
  }

  /**
   * Format a date field
   * @param array &$row
   * @param string $field
   * @param string $format
   * @return void
   */
  public static function formatDate(
    array &$row,
    string $field,
    string $format = 'Y-m-d'
  ): void {
    $date = $row[$field];
    if (!$date) return;
    $row[$field] = date($format, strtotime($date));
  }
}
