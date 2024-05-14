<?php

namespace ProcessWire;

/**
 * @author Bernhard Baumrock, 16.06.2022
 * @license COMMERCIAL DO NOT DISTRIBUTE
 * @link https://www.baumrock.com
 */
class FieldtypeRockGrid extends FieldtypeTextarea
{

  public static function getModuleInfo()
  {
    return [
      'title' => 'RockGrid',
      'version' => json_decode(file_get_contents(__DIR__ . "/package.json"))->version,
      'summary' => 'Module to display a RockGrid in the page editor.',
      'icon' => 'table',
      'requires' => ['RockGrid'],
      'installs' => [],
    ];
  }

  public function init()
  {
    parent::init();
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
    $inputfields->remove('textformatters');
    $inputfields->remove('_text_fieldset');

    $inputfields->add([
      'type' => 'text',
      'name' => 'grid',
      'label' => 'Name of the grid to display',
      'value' => $field->get('grid'),
    ]);

    return $inputfields;
  }

  /**
   * Return the associated Inputfield
   *
   * @param Page $page
   * @param Field $field
   * @return Inputfield
   *
   */
  public function getInputfield(Page $page, Field $field)
  {
    $f = $this->wire(new InputfieldRockGrid());
    $f->grid = $field->get('grid');
    return $f;
  }
}
