'use strict';

const chalk = require('chalk');
const Client = require('node-xmpp-client');
const Slack = require('slack-client');
const Raffle = require('./Raffle');

class Bot {
  constructor(opts) {
    this.opts = opts;

    this.slack = new Slack(opts.token);
    this.slack.login();

    this.raffle = new Raffle();
  }
  connect() {
    this.client = new Client(this.opts.xmpp);
    this.attachListeners();
  }
  attachListeners() {
    this.client.on('online', () => {
      this.sendPresence();

      setInterval(() => this.sendPresence(), 180000);
      setInterval(() => this.sendMessage(this.raffle.notification()), 600000);
    });
    this.client.on('stanza', (stanza) => {
      if(stanza.is('presence') && stanza.attrs.type != 'error') {
        let parsedPresence = Bot.parsePresence(stanza);
        let user = parsedPresence.user;

        if(user != this.opts.user) {
          this.sendToSlack(parsedPresence);
        }
      }
      else if(stanza.is('message') && stanza.attrs.type != 'error') {
        let parsedMessage = Bot.parseMessage(stanza);
        let user = parsedMessage.user;

        // Raffle regexs
        if(/^!enter$/.test(parsedMessage.msg)) {
          this.sendMessage(this.raffle.handleEntry(user));
        }
        if(/^!draw$/.test(parsedMessage.msg) && this.opts.user) {
          this.sendMessage(this.raffle.handleDrawing());
        }

        if(user != this.opts.user) {
          this.sendToSlack(parsedMessage);
        }
      }
    });
    this.client.on('error', (err) => {
      console.log(err);
    });
    this.slack.on('open', () => {
      this.channel = this.slack.getChannelGroupOrDMByName(this.opts.channel);
    });
    this.slack.on('message', (message) => {
      if(message.username == 'google' || message.subtype != 'bot_message') {
        this.sendMessage(message.text);
      }
    });
  }
  sendPresence() {
    this.client.send(
      new Client.Element('presence', {
        to: this.opts.roomJid + '/' + this.opts.user
      })
    );
  }
  sendMessage(message) {
    console.log(`${chalk.green(this.opts.user)}: ${message}`)

    let stanza  = new Client.Stanza('message', {
      to: this.opts.roomJid,
      type: 'groupchat'
    })
    .c('body').t(message);

    this.client.send(stanza);
  }
  sendToSlack(parsedStanza) {
    let message = {
      text: parsedStanza.msg,
      username: parsedStanza.user,
      parse: 'full',
      icon_url: parsedStanza.user != this.opts.nickname ?
        `http://api.adorable.io/avatars/48/${parsedStanza.user}.png` : undefined
    }

    console.log(`${chalk.green(message.username)}: ${message.text}`)

    if(this.channel) {
      this.channel.postMessage(message);
    }
  }
  static parsePresence(stanza) {
    let jid = stanza.attrs.from;
    let username = jid.substr(jid.indexOf( '/' ) + 1);
    let message = stanza.attrs.type || 'available';

    return { user: username, msg: message };
  }
  static parseMessage(stanza) {
    let jid = stanza.attrs.from;
    let username = jid.substr(jid.indexOf( '/' ) + 1);
    let body = Bot.findChild('body', stanza.children);
    let message = body.children.join('').replace('\\', '');

    return { user: username, msg: message };
  }
  static findChild(name, children) {
    for(var child of children) {
      if(child.name == name) {
        return child;
      }
    }
  }
}

module.exports = Bot;
