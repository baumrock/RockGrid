<?php

namespace ProcessWire;

$info = [
  'title' => 'RockGrid',
  'version' => json_decode(file_get_contents(__DIR__ . "/package.json"))->version,
  'summary' => 'Tabular Data Listings for ProcessWire',
  'autoload' => true,
  'singular' => true,
  'icon' => 'table',
  'requires' => [
    'PHP>=8.1',
  ],
  'installs' => [
    'FieldtypeRockGrid',
    'InputfieldRockGrid',
  ],
];
