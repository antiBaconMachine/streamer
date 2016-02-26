#!/usr/bin/env node
'use strict';
const exec = require('child_process').execSync;
const command = process.argv[2] === '-w' ? 'watchify' : 'browserify';
const line = `mkdir -p build && ${command} index.js -o build/bundle.js`;
console.log(line);
exec(line);
