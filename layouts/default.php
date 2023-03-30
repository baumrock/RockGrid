<div class='RockGrid' id='<?= $grid->id ?>'>
  <div class='rg-filter'><?= $grid->getFilters() ?></div>
  <div class='rg-header uk-child-width-1-1 uk-child-width-auto@m' uk-grid>
    <div class='uk-text-left rg-left'>
      <div class='rg-buttons rg-buttons-left'>
        <?= $grid->getButtonsLeft()->render() ?>
      </div>
    </div>
    <div class='uk-text-center rg-center uk-width-expand@m'>
      <div class='rg-buttons rg-buttons-right'>
        <?= $grid->getButtonsCenter()->render() ?>
      </div>
    </div>
    <div class='uk-text-right rg-right'>
      <div class='rg-buttons rg-buttons-right'>
        <?= $grid->getButtons()->render() ?>
      </div>
    </div>
  </div>
  <div class='rg-grid'>JS error</div>
  <div class='rg-footer'></div>
</div>