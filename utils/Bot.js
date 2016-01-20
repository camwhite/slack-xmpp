'use strict';

const chalk = require('chalk');
const Client = require('node-xmpp-client');
const Slack = require('slack-client');

class Bot {
  constructor(opts) {
    this.opts = opts;
    this.slack = new Slack(opts.token);

    this.slack.login();
  }
  connect() {
    this.client = new Client(this.opts.xmpp);
    this.attachListeners();
  }
  attachListeners() {
    this.client.on('online', () => {
      this.sendPresence();

      setInterval(() => this.sendPresence(), 180000);
    });
    this.client.on('stanza', (stanza) => {
      if(stanza.is('presence') && stanza.attrs.type != 'error') {
        this.sendToSlack(Bot.parsePresence(stanza));
      }
      else if(stanza.is('message') && stanza.attrs.type != 'error') {
        this.sendToSlack(Bot.parseMessage(stanza));
      }
    });
    this.client.on('error', (err) => {
      console.log(err);
    });
    this.slack.on('message', (message) => {
      if(message.subtype != 'bot_message') {
        var stanza  = new Client.Stanza('message', {
          to: this.opts.roomJid,
          type: 'groupchat'
        })
        .c('body').t(message.text);
        this.client.send(stanza);
      }
    });
  }
  sendPresence() {
    this.client.send(
      new Client.Element('presence', {
        to: this.opts.roomJid + '/' + this.opts.room
      })
    );
  }
  sendToSlack(parsedStanza) {
    const channel = this.slack.getChannelGroupOrDMByName(this.opts.channel);
    const message = {
      text: parsedStanza.msg,
      username: parsedStanza.user,
      parse: 'full',
      icon_url: parsedStanza.user != this.opts.nickname ?
        `http://api.adorable.io/avatars/48/${parsedStanza.user}.png` : undefined
    }

    console.log(`${chalk.green(message.username)}: ${message.text}`)

    channel.postMessage(message);
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
