const TelegramBot = require("node-telegram-bot-api");
const { token } = require("./secrets.json");
const { onMessage } = require("./onMessage");
const { onStart } = require("./onStart");
const schedule = require("node-schedule");
const { getAllUsersOlderThan5Minutes, removeFromDb } = require("./helpers");

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  onMessage(msg, bot);
});

onStart();

const banTooOldUsers = async () => {
  const users = getAllUsersOlderThan5Minutes();

  for (const i in users) {
    try {
      await bot.deleteMessage(users[i].chatId, users[i].messageId);
    } catch {
      console.error("FAILED TO REMOVE MESSAGE");
    }
    try {
      await bot.banChatMember(users[i].chatId, users[i].userId);
    } catch (err) {
      console.error("FAILED TO REMOVE MEMBER");
    }
    removeFromDb(
      "pendingUsers",
      `userId = ${users[i].userId} and chatId = ${users[i].chatId}`
    );
  }
};

schedule.scheduleJob("*/5 * * * *", banTooOldUsers);

banTooOldUsers();
