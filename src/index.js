'use strict';

const dragula = require('dragula'),
    grid = require('grid'),
    controls = require('controls'),
    stream = require('stream'),
//    through = require('through2'),
    speed = require('speed'),
    streamMatrix = require('streamMatrix'),
    throttle = require('throttle').throttle;

const transforms = {
    plus1: require('transform/plus1'),
    double: require('transform/double'),
    thru: require('transform/thru')
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

function makeNumbersSource() {
    const source = stream.Readable();
    const numbers = Array(10).fill(0).map((n, i) => i + 1);
    source._read = function() {
        if (!numbers.length) {
            //source.push(null);
            return;
        }
        source.push('' + numbers.shift());
    };
    return source;
}

function makeTransform(el) {
    const name = el && el.getAttribute('data-transform');
    const cns = transforms[name];
    return cns ? cns() : null;
}

function makeConsoleDest() {
    const dest = stream.Writable();
    dest._write = function(chunk, enc, next) {
        console.log(chunk.toString());
        next();
    };
    return dest;
}

function clearValues() {
    [].slice.call(document.querySelectorAll('.value_holder')).forEach((el) => el.innerHTML = '');
}

const buttons = controls({
    'start': function() {
        clearValues();
        const row = [].slice.call(document.querySelectorAll('.matrix .row_0 .transform')).map(makeTransform).map(throtler);
        const source = makeNumbersSource();
        const pipeline = streamMatrix.row(row);
        const dest = makeConsoleDest();
        source.pipe(pipeline).pipe(dest);
    }
});

const slider = speed.slider(25, 3000, event => interval = event.target.value);

container.appendChild(shop);
container.appendChild(matrix);
container.appendChild(buttons);
container.appendChild(slider);

window.drake = dragula([].slice.apply(document.querySelectorAll('.cell')), {
    accepts: function(el, target) {
        return target.classList.contains('matrix__cell') && !target.querySelector('.transform');
    },
    copy: function(el) {
        return el.parentNode.classList.contains('copyable');
    }
});
