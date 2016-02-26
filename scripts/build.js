#!/usr/bin/env node
const exec = require('child_process').execSync;
const command = process.argv[2] === '-w' ? 'watchify' : 'browserify';
const line = `mkdir -p build && ${command} src/index.js -o build/bundle.js -d`;
console.log(line);
exec(line);
