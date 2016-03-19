# Slack XMPP Client

**Communicate within Slack using an external xmpp chat**

![](http://i.imgur.com/QsRj81O.png)

### Setup

*You will need to [create](https://my.slack.com/services/new/bot) a Slack bot and retrieve its token*

Create a `config.json` file at the project root containing the following
information

```
{
  "nickname": "<your-slack-bots-username>", // ie. foobot
  "channel": "<your-slack-channel>",        // ie. #barchannel
  "token": "<your-bots-slack-token>",
  "user": "<the-xmpp-room-name>",           // ie. foobar
  "roomJid": "<the-xmpp-room-jid>",         // ie. foobar@chat.baz.com
  "xmpp": {
    "jid": "<your-xmpp-jid>",               // ie. bar@baz.com
    "password": "<your-xmpp-password>"
  }
}
```


### Installation & Usage

1. clone this repository
2. include your `config.json`
3. run `npm i`
4. run `node app`
