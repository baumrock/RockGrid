# Translations

RockGrid heavily relies on frontend technology and ProcessWires translation system is only available on the backend PHP world. Luckily RockGrid provides a way to easily define translatable strings in PHP and then access them from JavaScript.

## Defining Translations

You can define your own translations in any PHP file, for example `site/ready.php`:

```php
rockgrid()->x('foo', __('bar'));
```

## Accessing Translations

<img src=https://i.imgur.com/KVd4dxY.png class=blur alt='Access Translations'>

As you can see you can easily access translations via the RockGrid.x object:

```js
console.log(RockGrid.x('foo'));
```
