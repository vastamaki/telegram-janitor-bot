import schedule from "node-schedule";
import TelegramBot from "node-telegram-bot-api";

import { getAllUsersOlderThan5Minutes, removeFromDb, sql } from "./helpers.js";
import { onMessage } from "./onMessage.js";

const { TG_TOKEN } = process.env;

const bot = new TelegramBot(TG_TOKEN, { polling: true });

bot.on("message", async (msg) => {
  onMessage(msg, bot);
});

sql
  .prepare(
    `CREATE TABLE IF NOT EXISTS pendingUsers(chatId STRING, userId STRING, challenge STRING, username STRING, messageId STRING, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`
  )
  .run();

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
