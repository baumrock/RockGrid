<?php

namespace ProcessWire;

use RockGrid\RockGridField;

/**
 * @author Bernhard Baumrock, 16.06.2022
 * @license COMMERCIAL DO NOT DISTRIBUTE
 * @link https://www.baumrock.com
 */
class FieldtypeRockGrid extends Fieldtype
{

  public static function getModuleInfo()
  {
    return [
      'title' => 'RockGrid',
      'version' => json_decode(file_get_contents(__DIR__ . "/package.json"))->version,
      'summary' => 'Module to display a RockGrid in the page editor.',
      'icon' => 'table',
      'requires' => ['RockGrid'],
    ];
  }

  public function sanitizeValue(Page $page, Field $field, $value)
  {
    return $value;
  }

  /** FIELDTYPE METHODS */

  /**
   * Return the fields required to configure an instance of FieldtypeText
   *
   * @param Field $field
   * @return InputfieldWrapper
   *
   */
  public function ___getConfigInputfields(Field $field)
  {
    $inputfields = parent::___getConfigInputfields($field);

    // prepare variables and markup
    $url = wire()->pages->get(2)->url . 'setup/grids/';
    $grids = '';
    foreach (rockgrid()->gridsArray as $k => $v) {
      $grids .= "\n$k";
    }

    // add field
    $inputfields->add([
      'type' => 'text',
      'name' => 'grid',
      'label' => 'Name of the grid to display',
      'value' => $field->get('grid'),
      'notes' => "Manage grids here: [$url]($url)
        Available grids: $grids",
    ]);

    return $inputfields;
  }

  public function ___formatValue(Page $page, Field $field, $value)
  {
    return new RockGridField($page, $field, $value);
  }

  /**
   * Get database schema used by the Field
   *
   * @param Field $field
   * @return array
   *
   */
  public function getDatabaseSchema(Field $field)
  {
    $schema = parent::getDatabaseSchema($field);
    $schema['data'] = 'JSON';

    // Remove the default index that ProcessWire adds for the data column
    // since MySQL doesn't allow direct indexing on JSON columns
    // fixes this issue: https://processwire.com/talk/topic/31057--
    unset($schema['keys']['data']);

    return $schema;
  }

  /**
   * Return the associated Inputfield
   *
   * @param Page $page
   * @param Field $field
   * @return Inputfield
   */
  public function getInputfield(Page $page, Field $field)
  {
    $f = $this->wire(new InputfieldRockGrid());
    $f->grid = $field->get('grid');
    return $f;
  }
}
