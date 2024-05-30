# RockGrid Docs

## Use Cases

- Advanced Lister Alternative
- Advanced Page Reference Field
- Custom Spreadsheet Inputs
- Selecting Users (eg Recipients of a Newsletter)

## Limitations

RockGrid stores information about selected pages as JSON in the database. That means it will be less scalable then native page reference fields and your database needs to support the JSON datatype (as recent versions of MySQL and MariaDB do).
