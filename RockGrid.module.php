<?php

namespace ProcessWire;

use RockGrid\ButtonsArray;
use RockGrid\Grid;

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

    // devtools
    if (function_exists('\ProcessWire\rockmigrations')) {
      $rm = rockmigrations();
      $rm->saveCSS(__DIR__ . '/RockGrid.less', minify: true, keepCSS: false);
    }
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

  private function loadGridsArray(): void
  {
    // reset cache on modules refresh
    $this->wire->addHookAfter('Modules::refresh', $this, 'refresh');

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

  public function refresh(): void
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
   * @return void
   */
  public function sse($msg)
  {
    echo "data: $msg\n\n";
    echo str_pad('', 8186) . "\n";
    flush();
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
