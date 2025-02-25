# Batch Updates

Editing one row at a time is straightforward. Updating multiple rows is a bit more complicated.

## Easy Method

Sends one AJAX request and updates all rows at once.

Create a button

```php
$this->buttonsRight->add([
  'name' => 'markClaimed',
  'icon' => 'check',
  'attrs' => ['show-when-selected', 'show-when-filtered'],
  'tooltip' => 'Mark selected/filtered items as claimed',
]);
```

Add JavaScript to react on button clicks:

```js
// claimed button
RockGrid.on("button:markClaimed", (button) => {
  UIkit.modal.dialog(`
    <div class='uk-modal-body'>
      <h3 class='uk-text-bold'>Mark items claimed</h3>
    </div>
  `);
});

// during development it can be helpful to trigger the modal on every pageload
setTimeout(() => {
  document.querySelector(".rockgridbutton[data-name=markClaimed]").click();
}, 10);
```

Next we build the UI for entering the invoice number, for example:

<img src=https://i.imgur.com/8eUlFic.png class=blur>

```js
RockGrid.on("button:markClaimed", (button) => {
  const filteredCnt = table.getData("active").length;
  const selectedCnt = table.getSelectedRows().length;
  UIkit.modal.dialog(`
    <div class="uk-modal-body">
      <h3 class='uk-text-bold'>Mark items claimed</h3>
      <p>
        <label class='uk-margin-small-right'>
          <input class="uk-radio" type="radio" name="type" value="filtered" checked>
          All filtered rows (${filteredCnt})
        </label>
        <label>
          <input class="uk-radio" type="radio" name="type" value="selected" ${
            selectedCnt === 0 ? "disabled" : ""
          }>
          Selected rows (${selectedCnt})
        </label>
      </p>
      <p>
        <label><input class="uk-input" type="text" placeholder="Claimed with (eg INV123) ..." id="claimedwith"></label>
      </p>
    </div>
    <div class="uk-modal-footer uk-text-right">
      <button class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
      <button disabled class="uk-button uk-button-primary" type="button" id="confirm-claim">
        <i class='fa fa-check' style='margin-right:5px'></i>
        <i class='fa fa-spinner fa-spin' style='margin-right:5px' hidden></i>
        Mark as Claimed
      </button>
    </div>
  `);
});
```

Now let's improve the UI of our form and disable the submit button as long as we don't have input:

```js
// disable #confirm-claim button as long as no input
document.addEventListener("input", function (event) {
  const el = event.target;
  if (!el) return;
  if (el.id !== "claimedwith") return;
  document.getElementById("confirm-claim").disabled = el.value === "";
});
```

Now we need to add the code to handle the confirm button click. For testing we start simple:

```js
// handle click on confirm button
document.addEventListener("click", function (event) {
  if (!event.target) return;
  if (event.target.id !== "confirm-claim") return;
  const input = document.getElementById("claimedwith").value;
  alert(input);

  // show loading spinner and disable button
  // get ids of selected/filtered rows
  // send ajax request to mark selected rows as claimed
  // reload grid when done
  // close modal
});
```

And here is the full implementation:

```js
document.addEventListener("click", function (event) {
  if (!event.target) return;
  if (event.target.id !== "confirm-claim") return;
  const dialog = event.target.closest(".uk-modal-dialog");
  const input = document.getElementById("claimedwith").value;

  // show loading spinner and disable button
  dialog.querySelector("#confirm-claim").disabled = true;
  dialog.querySelector(".fa-check").hidden = true;
  dialog.querySelector(".fa-spinner").hidden = false;

  // get ids of selected/filtered rows
  let rowType = "filtered";
  const radio = dialog.querySelector('input[name="type"]:checked');
  if (radio) rowType = radio.value;
  let ids = [];
  if (rowType === "selected") {
    ids = table.getSelectedRows().map((row) => row.getData().id);
  } else {
    ids = table.getData("active").map((row) => row.id);
  }

  // send ajax request to mark selected rows as claimed
  const body = new URLSearchParams({
    ids: ids.join(","),
    claimedwith: input,
  });
  fetch("/path-to-your-endpoint", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) throw new Error(data.message);

      // close modal after 5s
      setTimeout(() => {
        UIkit.modal(event.target.closest(".uk-modal")).hide();
      }, 5000);

      // reload grid when done
      grid.reload();

      // close modal
      UIkit.modal(event.target.closest(".uk-modal")).hide();
    })
    .catch((error) => {
      UIkit.notification({
        message: "An error occurred while processing your request",
        status: "danger",
        timeout: 5000,
      });
      // close modal after 5s
      setTimeout(() => {
        UIkit.modal(event.target.closest(".uk-modal")).hide();
      }, 5000);
    });
});
```

The button triggers an AJAX request to `/path-to-your-endpoint` which we have to implement on the backend. For that we first need to make our grid autoload:

```php
class Efforts extends Grid
{
  const autoload = true;

  public function init(): void
  {
    wire()->addHookAfter('/path-to-your-endpoint', $this, 'markAsClaimed');
  }

  // ...
}
```

Then we can add the `markAsClaimed` method:

```php
protected function markAsClaimed(HookEvent $event)
{
  // CAUTION: NEVER TRUST ANY USER INPUT!!
  $ids = wire()->input->post('ids', 'array');
  $with = wire()->input->post('claimedwith', 'string');
  foreach ($ids as $id) {
    $p = wire()->pages->get($id);
    // add checks as required, eg for proper page template, editable etc.
    if ($p->template != 'effort') continue;
    if (!$p->editable()) continue;
    $p->setAndSave('claimedwith', $with);
  }
  return ['success' => true];
}
```

## Advanced Method

Uses SSE to stream updates to the browser. TBD.
