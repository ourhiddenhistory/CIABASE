#!/bin/node

const fs = require('fs')
jsonexport = require('jsonexport');

const SOURCESFILE = './ABC/books'
const SOURCESALTFILE = './ABC/CODES'
const SUBJECTSFILE = './ABC/SUBJECTS'
const ENTRIESFILE = './ENTRIES-ALL'
const JSONOUTFILE = './CIABASE.json'
const CSVOUTFILE = './CIABASE.csv'

const TEXTOUTDIR = 'TEXTFILES'

const SOURCES = {}
const SUBJECTS = {}
const ENTRIES = []

const escapeHTML = str => str.replace(/[&<>'"]/g,
  tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag]));

let fileContents, lines

// SOURCES to object
fileContents = fs.readFileSync(SOURCESALTFILE, 'utf8');
lines = fileContents.split('\n');
lines = lines.filter(el => el != '')

for(l in lines){
  let parts = lines[l].split(',')
  if(parts.length == 1) continue

  parts[1] = parts[1].trim()
  let source = parts.shift()
  source = parts.join().trim()
  SOURCES[parts[1]] = source
}

// SOURCES to object
fileContents = fs.readFileSync(SOURCESFILE, 'utf8');
lines = fileContents.split('\n');
lines = lines.filter(el => el != '')

for(l in lines){
  let parts = lines[l].split(/^([A-Z&]+[ ]{2})/);

  if(parts.length == 1) continue

  parts[1] = parts[1].trim()
  parts[2] = parts[2].trim()
  SOURCES[parts[1]] = parts[2]
}

// SUBJECTS to object
fileContents = fs.readFileSync(SUBJECTSFILE, 'utf8');
lines = fileContents.split('\n');
lines = lines.filter(el => el != '')

for(l in lines){
  let parts = lines[l].split(/^([A-Z& ]+[ ]{2})/);

  parts = parts.filter(part => part != '')

  if(parts.length == 0) continue

  parts[0] = parts[0].trim()
  if(parts.length == 1)
    parts[1] = null
  else parts[1] = parts[1].trim()
  SUBJECTS[parts[0]] = parts[1]
}

// ENTRIES to array
fileContents = fs.readFileSync(ENTRIESFILE, 'utf8');
lines = fileContents.split('\n');
lines = lines.filter(el => el != '')

let ENTRY = {}
let subjects, fixedSubjects, parts

let index = 0
for(l in lines){

  ENTRY = {
    "id": index,
    "raw": escapeHTML(lines[l])
  }
  index++

  // fix emails
  email_regex = /([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  lines[l] = lines[l].replace(email_regex,'$1(at)$2');

  // split at first comma to get subject
  let subject_entry = lines[l].split(',')
  subject_entry.filter(el => el != '')
  ENTRY.subject = subject_entry[0].trim()
  ENTRY.subjectdesc = SUBJECTS[ENTRY.subject]
  if(ENTRY.subjectdesc){
    ENTRY.subject = `${ENTRY.subject}, ${ENTRY.subjectdesc}`
  }

  entry = subject_entry[1]

  // get sourcecode, source if available
  ENTRY.sourcecode = '.'
  ENTRY.source = 'No Source Listed'

  // The source is sometimes set off with a '<'. When it isn't, it is appended to the entry after the last '.'
  let entry_sourcecode = entry.split('<')
  if(entry_sourcecode.length > 1){
    let sourcecode_page = entry_sourcecode[1].split(' ')
    ENTRY.sourcecode = sourcecode_page[0]
    ENTRY.source = (SOURCES[sourcecode_page[0]] ? SOURCES[sourcecode_page[0]] : `No entry found for source code: <b>'${sourcecode_page[0]}'</b>, Refer to <a href="https://github.com/ourhiddenhistory/CIABASE/blob/master/ABC/books">source list</a> if needed.`)
    if(sourcecode_page.length > 1){
      sourcecode_page.shift()
      ENTRY.sourcepage = sourcecode_page.join(' ').replace(/~/g, ',').trim().replace(/^,|,$/g, '')
    }
    ENTRY.source = `${ENTRY.source} ${ENTRY.sourcepage}`
  }else{ // use everything after the last period
    ENTRY.source = entry.substring(entry.lastIndexOf(".") + 1, entry.length).trim();
    if(ENTRY.source === entry){
      ENTRY.source = 'None found. Check body of entry for source. Refer to <a href="https://github.com/ourhiddenhistory/CIABASE/blob/master/ABC/books">source list</a> if needed.'
    }
  }

  entry = entry_sourcecode[0]

  // get dates
  ENTRY.entrydates = []
  date_regex = RegExp(/(@[0-9\-\/]{2,5}@)/gi);
  dates = entry.match(date_regex)

  if(dates){
    for(d in dates){
      let _date = dates[d].replace(/^@|@$/g, '')
      if(_date.match(/^[0-9]{2}$/)){
        ENTRY.entrydates.push('19'+_date)
      }else if(_date.match(/[0-9]{2}\-[0-9]{2}/)){
        let range = _date.split('-')
        range[0] = '19'+range[0]
        range[1] = '19'+range[1]
        ENTRY.entrydates.push(range.join('-'))
      }else{
        ENTRY.entrydates = []
      }
    }

    for(d in dates){
      replace_date_regex = RegExp(dates[d], 'g')
      entry = entry.replace(replace_date_regex, ENTRY.entrydates[d])
    }
  }
  ENTRY.entrydates.sort()

  // get entry
  entry = entry.replace(/([A-Z,\- ]?[0-9\-]{4,9})/, '$1|')
  entry = entry.replace(/(\|[A-Z])/, ' $1')
  opening_entry = entry.split('|')
  if(opening_entry.length > 1){
    opening_entry[0] = opening_entry[0].trim()
    opening_entry[1] = opening_entry[1].trim()
    entry = '<strong>'+opening_entry[0]+'</strong> '+opening_entry[1]
  }

  ENTRY.entry = entry.replace().replace(/\~/g, ',').replace(/\^/g, '"').trim().replace(/^,|,$/g, '')

  if(l == 27369){
    console.log("\n");
    console.log(entry_sourcecode);
    console.log("\n");
    console.log(ENTRY);
  }

  // get source
  ENTRIES[ENTRY.id] = ENTRY

}

ENTRIES.forEach(el => {
  const filename = `111-ciabase_${el.id + 1}.txt`
  const text = `
<small>SUBJECT:</small> ${el.subject}

<small>DATES:</small> ${el.entrydates}
<small>ENTRY:</small> ${el.entry}

<small>SOURCE:</small> ${el.source}

<hr />
<small>
  raw: <pre style="white-space: pre-wrap;">${el.raw}</pre>
</small>
`
  fs.writeFileSync(`${TEXTOUTDIR}/${filename}`, text)
  console.log(`writing ${el.id + 1}`);
})

const json = JSON.stringify(ENTRIES, null, 2);
fs.writeFile(JSONOUTFILE, json, (err) => {
  if (err) {
    return console.log(err);
  }
  return err;
});


for(i in ENTRIES){
  ENTRIES[i].entrydates.join(', ')
  if(ENTRIES[i].entrydates == '')
    ENTRIES[i].entrydates = '.'
}
jsonexport(ENTRIES,function(err, csv){
    if(err) return console.log(err);
    fs.writeFile(CSVOUTFILE, csv, (err) => {
      if (err) {
        return console.log(err);
      }
      return err;
    });
});
