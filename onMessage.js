const { saveToDb, getPendingUser, removeFromDb } = require("./helpers.js");
const { OWNER_ID } = process.env;

const primary_challenges = [
  "kymmene",
  "kakskytä",
  "kolkytä",
  "nelkytä",
  "viiskytä",
  "kuuskytä",
  "seittemäkytä",
  "kahreksankytä",
  "yhreksänkytä",
];
const secondary_challenges = [
  "yks",
  "kaks",
  "kolome",
  "nelejä",
  "viisihi",
  "kuusihi",
  "seittemä",
  "kahreksan",
  "yhreksän",
];

const onMessage = async (msg, bot) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const message = msg.text;

  const addNewUser = async (user) => {
    const rand1 = Math.floor(Math.random() * primary_challenges.length);
    const rand2 = Math.floor(Math.random() * primary_challenges.length);
    const primary_challenge = primary_challenges[rand1];
    const secondary_challenge = secondary_challenges[rand2];

    const answer = parseInt((rand1 + 1).toString() + "0") + (rand2 + 1);

    const challenge_message = await bot.sendMessage(
      chatId,
      `Tere [${
        user.username || user.first_name || user.last_name
      }](tg://user?id=${
        user.id
      })! Kirjotteleppa ihan ekana tänne numeroin et mit mahtaa ol ${primary_challenge} ynnättynä ${secondary_challenge}? Harkihte tarkkaan, muuten joudun potkimaa sut täält veke. Täs vaa vähä funtsin et teikäläine suattaa olla botti.`,
      {
        parse_mode: "Markdown",
      }
    );

    saveToDb(
      {
        chatId,
        username: user.username,
        userId: user.id,
        challenge: answer,
        messageId: challenge_message.message_id,
      },
      "pendingUsers"
    );
  };

  if (message === "debug") {
    await addNewUser(msg.from);
    return;
  }

  for (const i in msg.new_chat_members) {
    await addNewUser(msg.new_chat_members[i]);
  }

  const user = getPendingUser(userId, chatId);

  if (message && user) {
    if (parseInt(message) === user.challenge) {
      try {
        const release_message = await bot.sendMessage(
          chatId,
          `Näyttääpi siltä et [${
            msg.from.username || msg.from.first_name || msg.from.last_name
          }](tg://user?id=${msg.from.id}) on suamalaine!`,
          {
            parse_mode: "Markdown",
          }
        );

        setTimeout(
          async () =>
            await bot.deleteMessage(chatId, release_message.message_id),
          10000
        );
      } catch (err) {
        await bot.sendMessage(OWNER_ID, JSON.stringify(err));
        console.log("ERROR", err);
      }
    } else {
      try {
        await bot.banChatMember(chatId, msg.from.id);
      } catch (err) {
        await bot.sendMessage(OWNER_ID, JSON.stringify(err));
        console.log("ERROR", err);
      }
    }
    await bot.deleteMessage(chatId, msg.message_id);
    await bot.deleteMessage(chatId, user.messageId);
    removeFromDb("pendingUsers", `userId = ${userId} and chatId = ${chatId}`);
  }
};

module.exports = {
  onMessage,
};
