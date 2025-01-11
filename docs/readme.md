# RockGrid

<div class='uk-alert uk-alert-warning'>This module has been released at an early stage because it is a dependency for RockCalendar Recurring Events. The module itself is stable, but the documentation is not yet complete.</div>

## Use Cases

- Advanced Lister Alternative
- Advanced Page Reference Field
- Custom Spreadsheet Inputs
- Selecting Users (eg Recipients of a Newsletter)

## Limitations

- Scalability: RockGrid stores information about selected pages as JSON in the database. That means it will be less scalable then native page reference fields and your database needs to support the JSON datatype (as recent versions of MySQL and MariaDB do).
- Mobile Usage: RockGrid is intended to be used on desktop computers. It is usable on mobile as well to some extent, but certainly not optimised.
