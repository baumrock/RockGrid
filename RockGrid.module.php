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

  private $itemCallbackResult = false;

  public function init(): void
  {
    $config = wire()->config;
    $this->wire('rockgrid', $this);
    $this->grids = new WireData();
    $this->wire->classLoader->addNamespace('RockGrid', __DIR__ . '/classes');
    $this->loadGridsArray();

    if ($config->rockgridDebug) $this->debug = true;

    // ajax endpoints
    wire()->addHook('/rockgrid/ajax/{grid}/', $this, 'ajaxEndpoint');
    wire()->addHookAfter('Modules::refresh', $this, 'resetCache');
    wire()->addHookBefore('InputfieldForm::render', $this, 'hookRenderForm');

    // hooks to add grid view
    wire()->addHookBefore('ProcessPageEdit::buildForm', $this, 'buildFormGrid');
    wire()->addHookAfter('ProcessPageEdit::getSubmitActions', $this, 'buildFormGridRemoveSubmitActions');
    wire()->addHookAfter('ProcessPageListRender::getPageActions', $this, 'buildFormGridPageListActions');

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
    if (!$this->wire->config->debug) {
      // show deprecation warnings only in debug mode
      // these can break the json output and are not helpful in production
      error_reporting(E_ALL & ~E_DEPRECATED);
    }
    $gridname = $this->rawName($event->grid);
    $grid = $this->getGrid($gridname);
    if (!$grid) return $this->err('Grid not found');
    if (!$grid->isViewable()) return $this->err('No access');
    return $this->succ($grid->getData());
  }

  /**
   * Build the form that shows a RockGrid instead of the page edit form
   */
  protected function buildFormGrid(HookEvent $event): void
  {
    if (!$this->isGridView($event)) return;
    $event->replace = true;

    // remove headline
    $event->process->headline(' ');

    // get page
    $p = $event->process->getPage();

    $form = new InputfieldForm();
    $form->add([
      'name' => 'PageEditChildrenGrid',
      'type' => 'rockgrid',
      'grid' => $p->template->rockGridName,
      'skipLabel' => Inputfield::skipLabelHeader,
    ]);

    $event->return = $form;
  }

  /**
   * Show a list/grid icon in the page tree before the page edit tab
   */
  protected function buildFormGridPageListActions(HookEvent $event): void
  {
    $p = $event->arguments(0);
    $gridName = $p->template->rockGridName;
    if (!$gridName) return;
    $grid = $this->getGrid($gridName);
    if (!$grid) return;
    $actions = $event->return;
    $event->return = array_merge([[
      'cn' => 'rockGridView',
      'name' => '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>',
      'url' => $p->editUrl() . '&rockgrid=1',
    ]], $actions);
  }

  /**
   * Remove submit actions to avoid display glitches:
   * https://i.imgur.com/nF0ls4k.png
   */
  protected function buildFormGridRemoveSubmitActions(HookEvent $event): void
  {
    if (!$this->isGridView($event)) return;
    $event->return = [];
  }

  public function err($message)
  {
    header('Content-Type: application/json; charset=utf-8');
    return json_encode(['error' => $message]);
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
    $this->wire->config->scripts->add(
      rockgrid()->url(__DIR__ . '/lib/math.min.js', true)
    );
    $this->wire->config->scripts->add(
      rockgrid()->url(__DIR__ . '/lib/tabulator.min.js', true)
    );
    $this->wire->config->scripts->add(
      rockgrid()->url(__DIR__ . '/RockGrid.js', true)
    );
    $this->wire->config->scripts->add(
      rockgrid()->url(__DIR__ . '/scripts/buttons.js', true)
    );
    $this->wire->config->scripts->add(
      rockgrid()->url(__DIR__ . '/scripts/extensions.js', true)
    );

    $this->wire->config->styles->add(
      rockgrid()->url(__DIR__ . '/lib/tabulator.min.css', true)
    );
    $this->wire->config->styles->add(
      rockgrid()->url(__DIR__ . '/RockGrid.min.css', true)
    );
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
          glob($this->wire->config->paths->templates . "RockGrid/*.php"),
          glob($this->wire->config->paths->siteModules . "*/RockGrid/*.php")
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
   * This is what happens when before the sse stream is established.
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
      $this->wire->config->paths->root,
      $this->wire->config->urls->root,
      $path
    );
    if ($cachebuster) {
      $url = $this->wire->config->versionUrl(
        $url,
        !$this->coreversion,
      );
    }
    return $url;
  }

  /**
   * Config inputfields
   * @param InputfieldWrapper $inputfields
   */
  public function getModuleConfigInputfields($inputfields)
  {

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
}
