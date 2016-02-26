'use strict';

const dragula = require('dragula'),
    grid = require('grid');

const container = document.getElementById('container'),
    el = grid(1, 3);

container.appendChild(el);

const testel = document.createElement('div');
testel.innerHTML = 'X';

const containers = [].slice.apply(document.querySelectorAll('.cell')),
    drake = dragula(containers);

document.querySelector('.cell_00').appendChild(testel);

window.drake = drake;
