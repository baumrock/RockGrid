<?php

namespace ProcessWire;

use Tracy\Dumper;

/**
 * @author Bernhard Baumrock, 15.05.2024
 * @license COMMERCIAL DO NOT DISTRIBUTE
 * @link https://www.baumrock.com
 */
class ProcessRockGrid extends Process
{
  const permission = 'rockgrid-dashboard';

  public static function getModuleInfo()
  {
    return [
      'title' => 'RockGrid Dashboard',
      'version' => json_decode(file_get_contents(__DIR__ . "/package.json"))->version,
      'summary' => 'GUI for managing RockGrids',
      'icon' => 'table',
      'requires' => ['RockGrid'],

      'permission' => self::permission,
      'permissions' => [self::permission => 'May run the RockGrid Dashboard Module'],

      'page' => [
        'name' => 'rockgrid',
        'parent' => 'setup',
        'title' => 'RockGrid'
      ],
    ];
  }

  private function addCreateForm($form): void
  {
    $fs = new InputfieldFieldset();
    $fs->label = 'Add New Grid';
    $fs->icon = 'plus';
    // $fs->collapsed = Inputfield::collapsedYes;
    $form->add($fs);
    $error = false;

    if ($this->wire->config->debug) {
      if ($this->wire->input->post->creategrid) {
        $grids = rockgrid()->gridsArray;
        $gridname = $this->wire->input->post->gridname;
        $parts = explode("\\", $gridname, 2);
        if (count($parts) !== 2) {
          $gridname = "RockGrid\\" . ucfirst($gridname);
          $parts = explode("\\", $gridname, 2);
        }
        if (count($parts) !== 2) {
          $error = "Invalid Gridname";
        }
        if (array_key_exists($gridname, $grids)) {
          $error = "The grid $gridname does already exist - please choose another name!";
        }

        if (!$error) {
          // create grid
          $namespace = $parts[0];
          $name = $parts[1];
          if ($namespace === 'RockGrid') $dir = 'site/templates';
          else $dir = "site/modules/$namespace";
          $dir = $this->wire->config->paths->root . "$dir/RockGrid";

          // create files from stub
          $files = wire()->files;
          $files->mkdir($dir, true);

          // PHP
          $content = $files->fileGetContents(__DIR__ . '/stubs/Grid.txt');
          $replace = [
            '{namespace}' => $namespace,
            '{name}' => $name,
          ];
          $files->filePutContents(
            "$dir/$name.php",
            str_replace(
              array_keys($replace),
              array_values($replace),
              $content
            )
          );

          // JS
          $content = $files->fileGetContents(__DIR__ . '/stubs/Grid.js');
          $files->filePutContents(
            "$dir/$name.js",
            str_replace(
              '{gridHash}',
              rockgrid()->safeName($gridname),
              $content
            )
          );

          rockgrid()->refresh();
          $this->wire->session->redirect(
            './debug/?grid=' . rockgrid()->safeName($gridname)
          );
        }
      }

      $fs->add([
        'type' => 'text',
        'label' => 'Name',
        'name' => 'gridname',
        'notes' => 'If you enter a name only (eg Bar) this will create the grid in the templates folder (eg /site/templates/RockGrid/Bar.php).
          If you enter a name with Namespace (eg Foo\\Bar) the grid will be created in a modules folder (eg /site/modules/Foo/RockGrid/Bar.php).',
        'placeholder' => 'YourGridName',
      ]);
      if ($error) $fs->children()->last()->error($error);
      $fs->add([
        'type' => 'submit',
        'name' => 'creategrid',
        'value' => 'Create Grid',
        'icon' => 'check',
        'columnWidth' => 100,
        'wrapClass' => 'uk-margin-remove',
      ]);
    } else {
      $fs->add([
        'type' => 'markup',
        'value' => 'Creating new grids is only allowed if $config->debug is true.',
      ]);
    }
  }

  /**
   * Dashboard
   */
  public function execute()
  {
    if (wire()->input->get->refresh) {
      rockgrid()->refresh();
      $this->message('List of RockGrids has been refreshed.');
      wire()->session->redirect('./');
    }

    $this->headline('RockGrid Dashboard');
    $this->browserTitle('RockGrid Dashboard');
    /** @var InputfieldForm $form */
    $form = $this->wire->modules->get('InputfieldForm');
    $this->addCreateForm($form);

    $form->add([
      'type' => 'markup',
      'label' => 'Grids',
      'value' => $this->renderGrids(),
      'notes' => 'To remove a grid simply delete its files on the file system.',
    ]);

    return $form->render();
  }

  /**
   *
   */
  public function executeDebug()
  {
    $name = rockgrid()->rawName($this->wire->input->get->grid);
    rockgrid()->debug = true;

    $this->headline("Debug $name");
    $this->browserTitle("Debug $name");
    /** @var InputfieldForm $form */
    $form = $this->wire->modules->get('InputfieldForm');
    $form->prependMarkup('
      <style>
      #pw-content-body .tracy-dump-location-container {
        display:none;
      }
      </style>
    ');

    // find grid
    $grid = rockgrid()->getGrid($name);
    if (!$grid) wire()->session->redirect("../");

    $data = $grid->getData();
    if ($data === false) {
      $dump = 'No data available. Implement the getData() method in your grid class to provide data.';
    } else {

      ob_start();
      try {
        $dump = Dumper::dump($data);
      } catch (\Throwable $th) {
        if (is_array($data)) print_r($data);
        else var_dump($data);
      }
      $dump = ob_get_clean();
    }
    $step = (int)$this->wire->input->step;
    $collapsed = $step === 0 ? 0 : 1;
    $form->add([
      'type' => 'markup',
      'label' => 'Step 1: Define data of the grid in PHP getData()',
      'value' => $dump,
      'notes' => $grid->phpFile
        . "\n<a href=./?grid={$grid->name}&step=1>Keep step 1 open.</a>",
      'entityEncodeText' => false,
      'collapsed' => $step === 1 ? 0 : $collapsed,
    ]);
    $form->add([
      'type' => 'RockGrid',
      'name' => 'rockgrid-debug',
      'label' => 'Step 2: Define grid setup in JS',
      'grid' => $name,
      'notes' => $grid->jsFile
        . "\n<a href=./?grid={$grid->name}&step=2>Keep step 2 open.</a>",
      'entityEncodeText' => false,
      'collapsed' => $step === 2 ? 0 : $collapsed,
    ]);

    return $form->render();
  }

  private function renderGrids(): string
  {
    $out = '<table class="uk-table uk-table-small uk-table-striped">';
    $out .= '<tr><th>Name</th><th>Path</th></tr>';
    foreach (rockgrid()->gridsArray as $name => $path) {
      $hash = rockgrid()->safeName($name);
      $url = rockgrid()->url($path);
      $out .= "<tr><td><a href=./debug/?grid=$hash>$name</a></td><td>$url</td></tr>";
    }
    $out .= '</table>';

    $out .= '<a class=ui-button href=./?refresh=1>
      <i class="fa fa-refresh"></i>
      Refresh
      </a>';

    return $out;
  }
}
