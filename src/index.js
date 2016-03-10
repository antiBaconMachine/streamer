'use strict';

const dragula = require('dragula'),
    grid = require('grid'),
    controls = require('controls'),
    stream = require('stream'),
    throttle = require('throttled-stream');

const transforms = {
    plus1: require('transform/plus1'),
    double: require('transform/double'),
    thru: require('transform/thru')
};

const streams = Object.keys(transforms);

const container = document.getElementById('container');

const shop = grid(1, streams.length, (function() {
    return {
        gridClass: 'shop',
        cellClass: 'copyable',
        cb: function() {
            const stream = streams.shift();
            if (stream) {
                const el = document.createElement('div');
                el.setAttribute('data-transform', stream);
                el.innerHTML = stream;
                el.className = 'transform';
                return el;
            }
        }
    };
}()));

const matrix = grid(1, 5, {
    gridClass: 'matrix',
    cellClass: 'matrix__cell',
    cb: function() {
        const sub = document.createElement('span');
        sub.className = 'value_holder';
        return sub;
    }
});

function makeTransform(el) {
    const name = el && el.getAttribute('data-transform');
    const cns = transforms[name];
    if (cns) {
//        return throttle(cns(), 1);
        const s = cns();
        throttle(s, 2);
        s.on('data', n => el.parentNode.querySelector('.value_holder').innerHTML = n);
        return s;
    }
}

const buttons = controls({
    'start': function() {
        const source = stream.Readable();
        const numbers = Array(10).fill(1);
        source._read = function() {
            if (!numbers.length) {
                //source.push(null);
                return;
            }
            source.push('' + numbers.shift());
        };
        const out = [].slice.call(document.querySelectorAll('.matrix .row_0 .cell')).reduce(function(prev, cell) {
            const transEl = cell.querySelector('.transform');
            if (transEl) {
                const trans = makeTransform(transEl);
                if (trans) {
                    prev.pipe(trans);
                    return trans;
                }
            }
            return prev;
        }, source);


        const dest = stream.Writable();
        dest._write = function(chunk, enc, next) {
            console.log(chunk.toString());
            next();
        };

        out.pipe(dest);
    }
});

container.appendChild(shop);
container.appendChild(matrix);
container.appendChild(buttons);

window.drake = dragula([].slice.apply(document.querySelectorAll('.cell')), {
    accepts: function(el, target) {
        return target.classList.contains('matrix__cell') && !target.querySelector('.transform');
    },
    copy: function(el) {
        return el.parentNode.classList.contains('copyable');
    }
});
