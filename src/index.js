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
        cb: function() {
            const stream = streams.shift();
            if (stream) {
                const el = document.createElement('div');
                el.setAttribute('data-transform', stream);
                el.innerHTML = stream;
                el.className = 'copyable';
                return el;
            }
        }
    };
}()));

const matrix = grid(1, 5, {
    gridClass: 'matrix',
    cellClass: 'matrix__cell'
});

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
            const transEl = cell.children[0];
            if (transEl) {
                const trans = throttle(transforms[transEl.getAttribute('data-transform')](), 1);
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
        return !(target.childNodes.length) && target.classList.contains('matrix__cell');
    },
    copy: function(el) {
        return el.classList.contains('copyable');
    }
});
