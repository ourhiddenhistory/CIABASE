#!/bin/node

const fs = require('fs')

const SOURCESFILE = './ABC/books'
const SUBJECTSFILE = './ABC/SUBJECTS'
const ENTRIESFILE = './ENTRIES-ALL'

const SOURCES = {}
const SUBJECTS = {}
const ENTRIES = []

let fileContents, lines

// SOURCES to object
fileContents = fs.readFileSync(SOURCESFILE, 'utf8');
lines = fileContents.split('\n');

for(l in lines){
  let parts = lines[l].split(/^([A-Z&]+[ ]{2})/);

  console.log(parts)

  if(parts.length == 1) continue

  parts[1] = parts[1].trim()
  parts[2] = parts[2].trim()
  SOURCES[parts[1]] = parts[2]
}

console.log(SOURCES)

// SUBJECTS to object
fileContents = fs.readFileSync(SUBJECTSFILE, 'utf8');
lines = fileContents.split('\n');

// ENTRIES to array
fileContents = fs.readFileSync(ENTRIESFILE, 'utf8');
lines = fileContents.split('\n');
