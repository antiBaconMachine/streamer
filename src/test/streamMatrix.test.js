'use strict';

const test = require('tape');
const streamMatrix = require('streamMatrix');
console.log(streamMatrix);
const from = require('from2');
const through = require('through2');

const objects = [{
    foo: 'bar'
}];

const source = from.obj(objects);
const dest = through.obj();

test('it should assemble a pipeline of streams from an array of streams', t => {
    t.plan(1);
    streamMatrix.row([source, through.obj(), through.obj(), dest]).on('data', d => {
        t.deepEquals(d, objects[0]);
        t.end();
    });
});

