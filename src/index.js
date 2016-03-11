'use strict';

const dragula = require('dragula'),
    grid = require('grid'),
    controls = require('controls'),
    stream = require('stream'),
    speed = require('speed'),
    throttle = require('throttle').throttle,
    pumpify = require('pumpify');

const transforms = {
    '+1': require('transform/plus1'),
    '*2': require('transform/double'),
    '^2': () => (require('transform/pow')(2)),
    '√': () => (require('transform/pow')(0.5)),
    '=': require('transform/thru')
};

const destinations = {
    line: require('destination/lineChart')
};

const streams = Object.keys(transforms);

const container = document.getElementById('container');

let interval = 300;
const delay = {
    interval: () => interval
};

const throtler = s => throttle(delay, s);



const shop = grid(1, streams.length, (function() {
    return {
        gridClass: 'shop',
        cellClass: 'copyable cell',
        cb: function() {
            const stream = streams.shift();
            if (stream) {
                const el = grid(3, 3, {
                    cellClass: 'transform__cell',
                    cb: (i, j) => {
                        if (i === 1) {
                            const el = document.createElement('div');
                            if (j === 1) {
                                el.innerHTML = stream;
                            } else {
                                const inout = j === 0 ? 'input' : 'output';
                                el.className = `flowControl ${inout}`;
                            }
                            return el;
                        }
                    }
                });
                el.setAttribute('data-transform', stream);
                el.className = 'transform';
                return el;
            }
        }
    };
}()));

const matrix = grid(1, 5, {
    gridClass: 'matrix',
    cellClass: 'matrix__cell cell',
    cb: function() {
        const sub = document.createElement('span');
        sub.className = 'value_holder';
        return sub;
    }
});

function makeNumbersSource() {
    const source = stream.Readable();
//    const numbers = Array(10).fill(0).map((n, i) => i + 1);
    let i = 1;
    source._read = function() {
        if (!this.isPaused()) {
            this.push('' + i++);
        }
    };
    return source;
}

function makeTransform(el) {
    const transEl = el && el.querySelector('.transform');
    const name = transEl && transEl.getAttribute('data-transform');
    const cns = transforms[name];
    if (!cns) {
        return null;
    }
    const transform = cns();
    transform._el = el;
    return transform;
}

function makeConsoleDest() {
    const dest = stream.Writable();
    dest._write = function(chunk, enc, next) {
//        console.log(chunk.toString());
        next();
    };
    return dest;
}

function clearValues() {
    [].slice.call(document.querySelectorAll('.value_holder')).forEach((el) => el.innerHTML = '');
}

function inspector(stream) {
    if (stream && stream._el) {
        const label = stream._el.querySelector('.value_holder');
        stream.on('data', d => {
            label.innerHTML = d || '';
        });
    }
    return stream;
}

function destroy() {
    if (pipeline) {
        pipeline.destroy();
    }
    dest.render();
    clearValues();
}

let dest;
let pipeline;
const buttons = controls({
    'start': () => {
        destroy();
        const row = [].slice.call(document.querySelectorAll('.matrix .row_0 .cell'))
            .map(makeTransform)
            .filter(e => e)
            .map(throtler)
            .map(inspector);

        const source = makeNumbersSource();
        const streams = [source].concat(row, dest);

        pipeline = pumpify(streams);
        pipeline.on('destroy', clearValues);
    },
    'stop': destroy
});

const slider = speed.slider(25, 3000, event => interval = event.target.value);


dest = destinations.line();
container.appendChild(buttons);
container.appendChild(slider);
container.appendChild(shop);
container.appendChild(matrix);
container.appendChild(dest.el);


window.drake = dragula([].slice.apply(document.querySelectorAll('.cell')), {
    accepts: function(el, target) {
        return target.classList.contains('matrix__cell'); //&& !target.querySelector('.transform'); //this is too slow
    },
    copy: function(el) {
        return el.parentNode.classList.contains('copyable');
    },
    removeOnSpill: true
});

