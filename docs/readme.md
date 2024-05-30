# RockGrid Docs

## Use Cases

- Advanced Lister Alternative
- Advanced Page Reference Field
- Custom Spreadsheet Inputs
- Selecting Users (eg Recipients of a Newsletter)

## Limitations

RockGrid stores information about selected pages as JSON in the database. That means it will be less scalable then native page reference fields.

The storage type of the field is `MEDIUMTEXT` which can store up to 16.777.215 characters. If each page ID has 6 characters and is separated by a comma, each ID-comma pair takes up 7 characters.
That means you can store approximately 2.396.745 IDs separated by commas in a MEDIUMTEXT field. If ids are shorter you can store more, if ids are longer you can store less.
