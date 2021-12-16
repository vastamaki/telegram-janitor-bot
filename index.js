const TelegramBot = require("node-telegram-bot-api");
const { token } = require("./secrets.json");
const { onMessage } = require("./onMessage");
const { onStart } = require("./onStart");

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  onMessage(msg, bot);
});

onStart();
