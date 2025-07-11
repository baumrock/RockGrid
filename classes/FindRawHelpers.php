<?php

namespace RockGrid;

class FindRawHelpers
{

  /**
   * Takes a mysql date like 2025-07-08 12:00:00 and returns 2025-07-08
   */
  public static function day($value): string
  {
    if (!is_string($value)) return '';
    return substr($value, 0, 10);
  }

  /**
   * Example usage:
   * Given an array like this: https://i.imgur.com/1wRc6LI.png
   * We can use this to get the plain string value:
   * FindRawHelpers::get($row, "parent.rockinvoice_direction.0.value");
   *
   * @param array $row
   * @param string $path
   * @return string
   */
  public static function get(array $row, string $path): string
  {
    $parts = explode('.', $path);
    $current = $row;
    foreach ($parts as $part) {
      $value = $current[$part] ?? null;
      if (!$value) return '';
      $current = $value;
    }
    return $value;
  }
}
