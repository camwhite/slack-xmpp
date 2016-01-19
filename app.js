'use strict';

const config = require('./config');
const Bot = require('./utils/Bot');

var bot = new Bot(config);
bot.connect();
