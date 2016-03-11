'use strict';

const test = require('tape');
const streamMatrix = require('streamMatrix');
const from = require('from2');
const through = require('through2');
const stream = require('stream');

const objects = [{
    foo: 'bar'
}];

test('it should assemble a pipeline of streams from an array of streams', t => {
    t.plan(1);
    streamMatrix.row([from.obj(objects), through.obj(), through.obj(), through.obj()]).on('data', d => {
        t.deepEquals(d, objects[0]);
        t.end();
    });
});

test('it should fill in blank cells with through streams', t => {
    streamMatrix.row([from.obj(objects), undefined, false, through.obj()]).on('data', d=> {
        t.deepEquals(d, objects[0]);
        t.end();
    });
});

test('it should filter arbitrary objects from matrix', t => {
    const result = streamMatrix.filter([[1,2,3],[4,5,6]], n => n%2);
    t.deepEquals(result, [[1,3],[5]]);
    t.end();
});

test('it should filter transforms from matrix', t=> {
    const source = from.obj(objects);
    const thru = through.obj();
    const dest = stream.Writable();
    t.deepEquals(streamMatrix.transforms([[source, thru, dest]]), [[thru]]);
    t.end();
});
