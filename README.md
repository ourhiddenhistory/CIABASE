# CIABASE

## Current Schema

The database is organized by **SUBJECT** and **SOURCE**.

### SUBJECT

SUBJECT listing: `ABC/SUBJECTS`

Subject file formatted:

`{SUBJECT}` `{DESCRIPTION}`

**Issues**

- Could be difficult to parse because of spacing

### SOURCE

SOURCE listing (full bibliography): `ABC/books`
SOURCE listing (author, title): `ABC/CODES`

**Only full biblography is needed**

Source (full bibliography) formatted as:

`{SOURCE_CODE} {BIBLIOGRAPHY}`

*Note: Bibliographies contain linebreaks*

**Issues**

- SOURCE (full bibliography) may be hard to parse, contain numerous newlines
- Some SOURCES don't have SOURCE_CODES. These for the most part have the source appended to the end of the entry, after a `.`. If no source code is available, we set the source to whatever is after the last `.` in the entry.

**Fixes**

- Find replace newlines

### ENTRIES

The entries themselves are formatted in the following manner:

Single subject:

`{SUBJECT}, @{DATE/DATES}@ {ENTRY} <{SOURCE CODE} {PERIODICAL_DATE PAGE/PAGES}`

Multi subject:

`{SUBJECT,SUBJECT}~ @{DATE/DATES}@ {ENTRY} <{SOURCE CODE} {PERIODICAL_DATE PAGE/PAGES}`

DATE, PERIODICAL_DATE are sometimes excluded

Within each ENTRY, there are some character replacements:

- `^` should become a double quote
- `~` should become a comma

**Issues**

- SUBJECTS look to be duplicated in some ENTRIES
- Not all SUBJECTS are clearly delimited from ENTRIES

## Migrated Schema

Will test with [lunr.js](https://github.com/olivernn/lunr.js), though this may be too large a dataset.

```
{
  "SUBJECTS": "{csv}",
  "SOURCE": "{full bibliography with periodical date, pages}",
  "DATES": "{expand years to 19XX}"
  "ENTRY": "{entry only}"
}
```
