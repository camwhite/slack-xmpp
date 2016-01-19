## Slack XMPP Client

**Communicate within Slack using an external xmpp chat**

====

### Setup

Create a `config.json` file at the project root containing the following
information

```
{
  "nickname": "<your-slack-bots-username>", // ie. foobot
  "channel": "<your-slack-channel>", // ie. #barchannel
  "token": "<your-bots-slack-token>",
  "room": "<the-xmpp-room-name>", // ie. foobar
  "roomJid": "<the-xmpp-room-jid", // ie. foobar@chat.baz.com
  "xmpp": {
    "jid": "<your-xmpp-jid>", // ie. bar@baz.com
    "password": "your-xmpp-password"
  }
}
```

*You will need to create a Slack bot and retrieve its token*

### Installation & Usage

Clone this repository, include your `config.json` and run `node app`
