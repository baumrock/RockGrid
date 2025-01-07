# Magic Tags

RockGrid provides some magic tags that you can use to add functionality to your grids quickly and easily.

## Intro

Let's say you have a list of tags in a cell. And let's say you want to filter the grid by these tags. With a traditional approach you would have to do two things:

1. Add the markup to the columns formatter
2. Add some JS to listen for click events, then apply the filter

Step 1 is easy, but step 2 is a bit more involved. Where to put the JS code? How to listen for click events? How to apply the filter?

RockGrid has you covered! Just use a magic tag in your markup and forget about the rest!

## Header Filters

The magic tag for header filters is `rg-headerfilter`. Whenever an element with this magic tag tag lives in a column, RockGrid will automatically apply the filter to that column when the user clicks on the element:

```html
<span rg-headerfilter>Foo Bar</span>
```

Sometimes the value displayed is different from what you want to filter on:

```html
<span rg-headerfilter="/foo/bar">Foo Bar</span>
```

