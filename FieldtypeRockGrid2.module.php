<?php namespace ProcessWire;
/**
 * @author Bernhard Baumrock, 16.06.2022
 * @license COMMERCIAL DO NOT DISTRIBUTE
 * @link https://www.baumrock.com
 */
class FieldtypeRockGrid2 extends FieldtypeText {

  public static function getModuleInfo() {
    return [
      'title' => 'RockGrid2',
      'version' => '1.0.0',
      'summary' => 'Module to display a RockGrid2 in the page editor',
      'icon' => 'table',
      'requires' => ['RockGrid2'],
      'installs' => [],
    ];
  }

  public function init() {
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
  public function ___getConfigInputfields(Field $field) {
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
  public function getInputfield(Page $page, Field $field) {
    $f = $this->wire(new InputfieldRockGrid2());
    $f->grid = $field->get('grid');
    return $f;
  }

}
