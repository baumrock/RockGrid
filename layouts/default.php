<div class='RockGrid2' id='<?= $grid->id ?>'>
  <div class='rg-header uk-child-width-1-1 uk-child-width-1-3@m' uk-grid>
    <div class='uk-text-left rg-left'></div>
    <div class='uk-text-center rg-center'></div>
    <div class='uk-text-right rg-right'><?= $grid->getButtons()->render() ?></div>
  </div>
  <div class='rg-grid'></div>
  <div class='rg-footer'></div>
</div>