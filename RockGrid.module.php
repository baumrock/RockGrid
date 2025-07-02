<?php

namespace ProcessWire;

use RockGrid\ButtonsArray;
use RockGrid\Grid;
use stdClass;

function rockgrid(): RockGrid
{
  return wire()->modules->get('RockGrid');
}

/**
 * @author Bernhard Baumrock, 19.02.2021
 * @license COMMERCIAL DO NOT DISTRIBUTE
 * @link https://www.baumrock.com
 */
class RockGrid extends WireData implements Module, ConfigurableModule
{
  const gridsArrayCache = 'rockgrid-grids';

  public $debug = false;

  /**
   * @var WireData
   */
  public $grids;

  /**
   * @var array
   */
  public $gridsArray = [];

  public $loadLuxon = false;

  private $translations = [];

  public function init(): void
  {
    $config = wire()->config;
    $this->wire('rockgrid', $this);
    $this->grids = new WireData();
    $this->wire->classLoader->addNamespace('RockGrid', __DIR__ . '/classes');
    $this->loadGridsArray();

    if ($config->rockgridDebug) $this->debug = true;

    // ajax endpoints
    wire()->addHook('/rockgrid/ajax/{segment}/', $this, 'ajaxEndpoint');
    wire()->addHookAfter('Modules::refresh', $this, 'resetCache');
    wire()->addHookBefore('InputfieldForm::render', $this, 'hookRenderForm');

    // hooks to add grid view
    wire()->addHookBefore('ProcessPageEdit::buildForm', $this, 'childrenGridForm');
    wire()->addHookAfter('ProcessPageEdit::getSubmitActions', $this, 'childrenGridSubmitActions');
    wire()->addHookAfter('ProcessPageListRender::getPageActions', $this, 'childrenGridPageActions');

    // devtools
    if (function_exists('\ProcessWire\rockmigrations')) {
      $rm = rockmigrations();
      $rm->saveCSS(__DIR__ . '/RockGrid.less', minify: true, keepCSS: false);
    }
  }

  /**
   * Add an SSE endpoint
   *
   * getItems() must return an array of items.
   * itemCallback() is called for each item
   *
   */
  public function addSseEndpoint(
    string $url,
    callable $getItems,
    callable|null $itemCallback = null,
  ): void {

    // if no itemCallback is provided, use a default one
    // that returns the item as an array with an id equal to the item itself
    // that means that getItems() can return a $pages->findRaw() result directly
    // and the itemCallback will return the id of the page for every run
    // and RockGrid will add "current" and "progress" to the result
    if (!$itemCallback) $itemCallback = function ($item) {
      return ['id' => $item];
    };

    wire()->addHookAfter(
      $url,
      function () use ($getItems, $itemCallback) {
        $method = $_SERVER['REQUEST_METHOD'];
        if ($method === 'POST') {
          $raw = $this->sseEndpointPost();
          wire()->session->set('rockgrid-item-callback-result', false);

          // debug output
          if ($this->debug && function_exists('bd')) {
            $input = $this->sseInput();
            bd($input, 'sse endpoint post');
            bd($items = $getItems($input), 'getItems()');
            if (is_array($items)) {
              if (count($items)) {
                $result = $itemCallback($items[0], $input);
                wire()->session->set('rockgrid-item-callback-result', $result);
                bd($result, 'itemCallback()');
              } else {
                bd($items, 'getItems() returned an empty array');
              }
            } else {
              bd($items, 'WARNING: getItems() did not return an array');
            }
          }

          return $raw;
        } else {
          $this->sseEndpointStream($getItems, $itemCallback);
        }
      }
    );
  }

  protected function ajaxEndpoint(HookEvent $event)
  {
    if (!wire()->config->debug) {
      // show deprecation warnings only in debug mode
      // these can break the json output and are not helpful in production
      error_reporting(E_ALL & ~E_DEPRECATED);
    }
    $segment = $event->segment;

    // first check if a file in the ajax folder exists
    $file = __DIR__ . "/ajax/$segment.php";
    if (is_file($file)) return wire()->files->render($file);

    // then check if it's a grid
    $gridname = $this->rawName($segment);
    $grid = $this->getGrid($gridname);
    if (!$grid) return $this->err('Grid not found');
    if (!$grid->isViewable()) return $this->err('No access');
    return $this->succ($grid->getData());
  }

  /**
   * Show a list/grid icon in the page tree before the page edit tab
   */
  protected function childrenGridPageActions(HookEvent $event): void
  {
    $p = $event->arguments(0);
    $settings = $this->getChildrenGridSettings($p);
    if (!is_array($settings)) return;

    $actions = $event->return;
    $event->return = array_merge([[
      'cn' => 'childrenGrid',
      'name' => '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>',
      'url' => $p->editUrl() . '&rockgrid=1',
    ]], $actions);
  }

  /**
   * Remove submit actions to avoid display glitches:
   * https://i.imgur.com/nF0ls4k.png
   */
  protected function childrenGridSubmitActions(HookEvent $event): void
  {
    $p = $event->process->getPage();
    $settings = $this->getChildrenGridSettings($p);
    if (!is_array($settings)) return;
    $event->return = [];
  }

  /**
   * Build the form that shows a RockGrid instead of the page edit form
   */
  protected function childrenGridForm(HookEvent $event): void
  {
    $p = $event->process->getPage();
    $settings = $this->getChildrenGridSettings($p);
    if (!is_array($settings)) return;

    // show grid only if ?rockgrid=1
    if (!wire()->input->get('rockgrid')) return;

    // set options
    $opt = new WireData();
    $opt->setArray([
      'grid' => false,
      'skipLabel' => Inputfield::skipLabelHeader,
    ]);
    $opt->setArray($settings);

    $form = new InputfieldForm();
    $form->add([
      'name' => 'PageEditChildrenGrid',
      'type' => 'rockgrid',
      'grid' => $opt->grid,
      'skipLabel' => $opt->skipLabel,
    ]);

    $event->replace = true;
    $event->return = $form;
  }

  public function err($message)
  {
    header('Content-Type: application/json; charset=utf-8');
    return json_encode(['error' => $message]);
  }

  public function ___getChildrenGridSettings(Page $p): array|false
  {
    if (method_exists($p, 'childrenGridSettings')) {
      return $p->childrenGridSettings();
    }
    return false;
  }

  public function getGrid($data): Grid|null
  {
    // first get the gridname
    if ($data instanceof InputfieldRockGrid) $gridname = $data->grid;
    else $gridname = (string)$data;

    // if already loaded return it
    /** @var Grid $grid */
    $grid = $this->grids->get($gridname);
    if ($grid) return $grid;

    // load grid
    try {
      $grid = new $gridname();
      $grid->name = $this->safeName($gridname);
      $grid->phpFile = $this->gridsArray[$gridname];
      $grid->jsFile = substr($grid->phpFile, 0, -3) . 'js';
      $grid->cssFile = is_file($f = substr($grid->phpFile, 0, -3) . 'css')
        ? $f
        : false;
      $grid->buttonsRight = new ButtonsArray();
      $grid->buttonsLeft = new ButtonsArray();
      $grid->buttonsRight = new ButtonsArray();
    } catch (\Throwable $th) {
      $this->error($th->getMessage());
    }

    return $grid;
  }

  /**
   * Config inputfields
   * @param InputfieldWrapper $inputfields
   */
  public function getModuleConfigInputfields($inputfields)
  {

    $inputfields->add([
      'type' => 'checkbox',
      'name' => 'loadLuxon',
      'label' => 'Load LUXON Library (modern moment.js alternative)',
      'checked' => $this->loadLuxon ? 'checked' : '',
      'notes' => 'See https://moment.github.io/luxon/#/',
    ]);

    $inputfields->add([
      'type' => 'checkbox',
      'name' => 'debug',
      'label' => 'Debug Mode',
      'checked' => $this->debug ? 'checked' : '',
      'notes' => 'If enabled you will get additional info in the backend useful for debugging.',
    ]);

    $inputfields->add([
      'type' => 'checkbox',
      'name' => 'coreversion',
      'label' => 'Use core version for cache busting instead of filemtime',
      'notes' => 'Use this if filemtime is slow on your system.',
      'checked' => $this->coreversion ? 'checked' : '',
    ]);

    return $inputfields;
  }

  public function getKeyFromFile($file): string
  {
    $file = Paths::normalizeSeparators($file);
    $parts = explode('/', $file);
    $parts = array_reverse($parts);
    foreach ($parts as $i => $part) {
      if ($part === 'RockGrid') {
        $namespace = $parts[($i + 1)];
        $grid = substr($parts[($i - 1)], 0, -4);
        if ($namespace === 'templates') $namespace = 'RockGrid';
        return "$namespace\\$grid";
      }
    }
    return '';
  }

  public function getNamespaceFromFile($file): string
  {
    return explode('\\', $this->getKeyFromFile($file))[0];
  }

  /**
   * Load all dependencies
   * This can safely be called multiple times.
   * // TODO: Load it only when necessary. At the moment it's loaded on every form
   * to make sure that grids also work in repeaters that are loaded via ajax.
   */
  protected function hookRenderForm(HookEvent $event): void
  {
    wire()->modules->get('JqueryUI')->use('modal');
    wire()->config->scripts->add(
      rockgrid()->url(__DIR__ . '/lib/math.min.js', true)
    );
    if ($this->loadLuxon) {
      wire()->config->scripts->add(
        rockgrid()->url(__DIR__ . '/lib/luxon.min.js', true)
      );
    }
    wire()->config->scripts->add(
      rockgrid()->url(__DIR__ . '/lib/tabulator.min.js', true)
    );
    wire()->config->scripts->add(
      rockgrid()->url(__DIR__ . '/RockGrid.js', true)
    );
    wire()->config->scripts->add(
      rockgrid()->url(__DIR__ . '/scripts/magictags.js', true)
    );
    wire()->config->scripts->add(
      rockgrid()->url(__DIR__ . '/scripts/coldefs.js', true)
    );
    wire()->config->scripts->add(
      rockgrid()->url(__DIR__ . '/scripts/buttons.js', true)
    );
    wire()->config->scripts->add(
      rockgrid()->url(__DIR__ . '/scripts/extensions.js', true)
    );

    wire()->config->styles->add(
      rockgrid()->url(__DIR__ . '/lib/tabulator.min.css', true)
    );
    wire()->config->styles->add(
      rockgrid()->url(__DIR__ . '/RockGrid.min.css', true)
    );

    // translations
    // note: user translations have priority (so users can override stuff)
    $translations = array_merge([
      'cancel' => __('Cancel'),
      'edit' => __('edit'),
      'ok' => __('OK'),
      'trashSelected' => __('Are you sure you want to delete the selected items?'),
    ], $this->translations);
    wire()->config->js('RockGridTranslations', $translations);
  }

  /**
   * Helper method to check wether to show the grid view or not
   */
  private function isGridView(HookEvent $event): bool
  {
    $p = $event->process->getPage();
    $gridName = $p->template->rockGridName;
    if (!$gridName) return false;

    $grid = $this->getGrid($gridName);
    if (!$grid) return false;
    if (!wire()->input->get('rockgrid', 'int')) return false;
    return true;
  }

  private function loadGridsArray(): void
  {
    // get grids array from cache or recreate it
    $gridsArray = $this->wire->cache->get(
      self::gridsArrayCache,
      false, // use 0 to debug, false for production
      function () {
        $arr = [];
        $files = array_merge(
          glob(wire()->config->paths->templates . "RockGrid/*.php"),
          glob(wire()->config->paths->siteModules . "*/RockGrid/*.php")
        );
        foreach ($files as $file) {
          $arr[$this->getKeyFromFile($file)] = $file;
        }
        ksort($arr);
        return $arr;
      }
    );

    // check if path has changed (eg because of deployment)
    foreach ($gridsArray as $cls => $path) {
      if (!is_file($path)) {
        $this->resetCache();
        $this->loadGridsArray();
        return;
      }
    }

    // add classloader for all namespaces
    foreach ($gridsArray as $file) {
      $this->wire->classLoader->addNamespace(
        $this->getNamespaceFromFile($file),
        dirname($file)
      );
    }

    $this->gridsArray = $gridsArray;

    // for every grid trigger the static ::autoload method
    foreach ($gridsArray as $cls => $file) {
      // if class constant autoload exists
      if (!defined($cls . '::autoload')) continue;
      // load grid and trigger init()
      $grid = $this->getGrid($cls);
      if (method_exists($grid, 'init')) $grid->init();
    }
  }

  /**
   * Get raw name from safename
   * @param mixed $safename
   * @return string
   */
  public function rawName($safename): string
  {
    return str_replace('-', '\\', $safename);
  }

  public function ready(): void
  {

    // only regular requests
    if (wire()->config->ajax) return;
    if (wire()->config->external) return;

    // ---------- only backend requests below ----------
    if (wire()->page->template != 'admin') return;

    // page view redirects
    // handy if the id is known but the url is not
    if ($id = wire()->input->get('rockgrid-view', 'int')) {
      $p = wire()->pages->get($id);
      if ($p->viewable()) wire()->session->redirect($p->url);
    }
  }

  public function resetCache(): void
  {
    $this->wire->cache->delete(self::gridsArrayCache);
  }

  /**
   * Get url- and js-safe gridname
   * @param mixed $gridname
   * @return string
   */
  public function safeName($gridname): string
  {
    return str_replace('\\', '-', $gridname);
  }

  /**
   * Send SSE message to client
   */
  public function sse(mixed $msg): void
  {
    if (!is_string($msg)) $msg = json_encode($msg);
    echo "data: $msg\n\n";
    echo str_pad('', 8186) . "\n";
    flush();
  }

  /**
   * This is what happens before the sse stream is established.
   * We send a post request to the backend that contains all the data that
   * the sse stream will then process.
   */
  private function sseEndpointPost()
  {
    $rawInput = file_get_contents('php://input');
    wire()->session->set('rockgrid-sse-input', $rawInput);
    header('Content-Type: application/json; charset=utf-8');
    return $rawInput;
  }

  /**
   * This is what happens when the sse stream is established.
   * We send a stream of events to the client.
   */
  private function sseEndpointStream(
    callable $getItems,
    callable $itemCallback,
  ) {
    $maxExecutionTime = 10;
    header("Cache-Control: no-cache");
    header("Content-Type: text/event-stream");
    ini_set('max_execution_time', $maxExecutionTime);
    $input = $this->sseInput();
    $items = $getItems($input);
    if (!is_array($items)) return;
    // if debug mode is on we have already processed the first item
    // so we remove it now to not double-process it
    $all = count($items);
    if ($all < 1) return $this->sse('rockgrid-sse-done');
    $current = 0;
    if ($this->debug && function_exists('bd')) {
      array_shift($items);
      $result = wire()->session->get('rockgrid-item-callback-result');
      if (!is_array($result)) $result = [];
      $result['current'] = ++$current;
      $result['progress'] = round($current / $all, 2);
      $this->sse($result);
    }
    foreach ($items as $item) {
      ini_set('max_execution_time', $maxExecutionTime);
      $result = $itemCallback($item, $input);
      if (!is_array($result)) $result = [];
      $result['current'] = ++$current;
      $result['progress'] = round($current / $all, 2);
      $this->sse($result);
    }
    $this->sse('rockgrid-sse-done');
  }

  private function sseInput(): stdClass
  {
    return json_decode(wire()->session->get('rockgrid-sse-input'));
  }

  public function succ($data)
  {
    header('Content-Type: application/json; charset=utf-8');
    return json_encode($data);
  }

  /**
   * Convert path to url
   * @return string
   */
  public function url(string $path, $cachebuster = false): string
  {
    $path = Paths::normalizeSeparators($path);
    $url = str_replace(
      wire()->config->paths->root,
      wire()->config->urls->root,
      $path
    );
    if ($cachebuster) {
      $url = wire()->config->versionUrl(
        $url,
        !$this->coreversion,
      );
    }
    return $url;
  }

  /**
   * Add a new translatable string
   *
   * This method is intended to be used by the user to add custom translations.
   * Admin translations are set directly in this file in hookRenderForm.
   */
  public function x(string $key, string $translation): void
  {
    $this->translations[$key] = $translation;
  }
}
