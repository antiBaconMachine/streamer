'use strict';

const test = require('tape');
const through = require('through2');
const from = require('from2');
const throttle = require('throttle').throttle;

test('it should delay writes on a stream', t => {

    const vals = ['get this after 1 tick', '2 ticks', '3 ticks'];
    t.plan(vals.length);
    const delay = {
        interval: () => 0
    };

    from(vals).pipe(throttle(delay, through())).on('data', d => {
        t.equals(d.toString(), vals.shift());
    }).on('end', t.end);
});
