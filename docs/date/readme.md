# Dates & Times

Working with dates and times can be tedious. RockGrid ships with the `luxon` library to make it easier. Luxon is the successor of the well known `moment.js` library that utilises modern browser features to reduce overhead.

## Usage

```js
const from = "2025-01-03 12:00:00";
const date = luxon.DateTime.fromFormat(from, "yyyy-MM-dd HH:mm:ss");
console.log(date.toISODate()); // 2025-01-03
```
