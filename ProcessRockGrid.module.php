<?php

namespace ProcessWire;

class ProcessRockGrid extends Process
{

  const permission = "rockgrid";

  public static function getModuleInfo()
  {
    return [
      'title' => 'RockGrid Process Module',
      'version' => '0.0.1',
      'summary' => '',
      'icon' => 'table',
      'requires' => [
        'RockGrid',
      ],
      'installs' => [],

      'permission' => self::permission,
      'permissions' => [self::permission => 'May run the RockGrid process module'],

      'page' => [
        'name' => 'grids',
        'parent' => 2,
        'title' => 'Grids'
      ],
    ];
  }

  public function init()
  {
    parent::init(); // always remember to call the parent init
  }

  public function execute()
  {
    $this->headline('Grids');
    $this->browserTitle('Grids');
    $grid = $this->wire->input->get('grid', 'text');
    if (!$grid) return "No grid selected";

    // get grid
    $grid = $this->wire->modules->get("RockGrid")->getGrid($grid);
    $info = $grid->info();

    /** @var InputfieldForm $form */
    $form = $this->modules->get('InputfieldForm');

    $notes = '';
    if ($this->wire->user->isSuperuser()) {
      $url = "/rockgrid2/" . $grid->name;
      $notes = "[$url]($url)";
      if (!$this->wire->modules->isInstalled("TracyDebugger")) {
        $notes .= "\nMake sure to install TracyDebugger to make your life easier!";
      }
    }
    $form->add([
      'type' => 'RockGrid',
      'label' => $info->title,
      'grid' => $info->name,
      'notes' => "Superuser note: Debug grid via $notes",
    ]);

    return $form->render();
  }

  public function executeNew()
  {
    $this->headline('Grids');
    $this->browserTitle('Grids');

    if (!$this->wire->user->isSuperuser()) throw new Wire404Exception("No access");

    /** @var InputfieldForm $form */
    $form = $this->modules->get('InputfieldForm');
    $form->action = "./new";

    $name = $this->wire->input->post('grid', 'text');
    $name = ucFirst($this->wire->sanitizer->camelCase($name));

    $error = false;
    if ($name) {
      // create grid if it does not exist
      $grid = $this->master()->getGrid($name);
      if (!$grid) {
        $filename = $this->wire->config->paths->assets . "RockGrid/$name.php";
        $stub = $this->wire->files->fileGetContents(__DIR__ . "/stubs/Grid.php");
        $content = str_replace("{name}", $name, $stub);
        $this->wire->files->filePutContents($filename, $content);
        $this->warning("Created grid at $filename");
        $this->wire->session->redirect("./?grid=$name");
      } else $error = "Grid $name does already exist!";
    }

    $form->add([
      'type' => 'text',
      'name' => 'grid',
      'label' => 'Enter name of new grid',
      'value' => $name,
    ]);
    $f = $form->children()->last();
    if ($error) $f->error($error);

    $form->add([
      'type' => 'submit',
      'icon' => 'plus',
      'value' => 'Create Grid',
    ]);

    return $form->render();
  }

  /**
   * @return RockGrid
   */
  public function master()
  {
    return $this->wire->modules->get('RockGrid');
  }
}
