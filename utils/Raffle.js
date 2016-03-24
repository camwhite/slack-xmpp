'use strict';

const storage = require('node-persist');

class Raffle {
  constructor() {
    this.storage = storage;
    this.storage.initSync();

    this.storage.getItem('pool', (err, pool) => {
      if(err) return console.log(err);

      if(!pool) {
        this.storage.setItem('pool', []);
      }
      else {
        this.pool = pool;
      }
    });
  }
  notification(user) {
    return `Welcome @${user}, there's a giveaway going on! Type !enter in chat to be added to the raffle :monocle:`;
  }
  handleEntry(user) {
    for(let entrant of this.pool) {
      if(entrant == user) {
        return `@${user} you can only enter once per drawing..`
      }
    }

    this.pool.push(user);
    this.storage.setItem('pool', this.pool);

    return `Thanks for entry number ${this.pool.length}, @${user} keep an eye out for a winner's message, for which you only have 3 days to reply.`;
  }
  handleDrawing() {
    return `Come on down @${this.pool[Math.floor(Math.random() * this.pool.length)]} you're the fucking winner!!!`;
  }
}
module.exports = Raffle;
