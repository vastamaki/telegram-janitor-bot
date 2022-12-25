import * as dotenv from "dotenv";
dotenv.config({ path: "./stack.env" });

import knex from "knex";
import schedule from "node-schedule";
import TelegramBot from "node-telegram-bot-api";

import { onMessage } from "./onMessage.js";

export const db = knex({
  client: "mysql",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
  },
  pool: {
    min: 1,
    max: 1,
  },
});

const { TG_TOKEN } = process.env;

const bot = new TelegramBot(TG_TOKEN, { polling: true });

process.on("uncaughtException", async (err) => {
  try {
    await bot.sendMessage(process.env.OWNER_ID, `SOS: ${JSON.stringify(err)}`);
  } catch {
    console.error("FAILED TO SEND SOS");
  }
});

bot.on("message", async (msg) => {
  onMessage(msg, bot);
});

const banTooOldUsers = async () => {
  const users = await db("pending_users")
    .select("*")
    .where("timestamp", "<=", "Datetime('now', '-5 minutes', 'localtime')")
    .andWhere("answered", "=", false);

  for (const i in users) {
    try {
      await bot.deleteMessage(users[i].chatId, users[i].messageId);
    } catch {
      console.error("FAILED TO REMOVE MESSAGE");
    }
    try {
      console.log(users[i]);
      await bot.banChatMember(users[i].chatId, users[i].userId);
    } catch (err) {
      console.error("FAILED TO REMOVE MEMBER");
    }

    await db("pending_users")
      .delete()
      .where("userId", "=", users[i].userId)
      .andWhere("chatId", "=", users[i].chatId);
  }
};

schedule.scheduleJob("*/5 * * * *", banTooOldUsers);

banTooOldUsers();

try {
  await bot.sendMessage(process.env.OWNER_ID, "I just started successfully");
} catch (err) {
  console.error("FAILED TO INITIALIZE");
}
