const SQLite = require("better-sqlite3");
const sql = new SQLite(`/db/data.sqlite`);

const onStart = async () => {
  sql
    .prepare(
      `CREATE TABLE IF NOT EXISTS pendingUsers(chatId STRING, userId STRING, challenge STRING, username STRING, messageId STRING, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`
    )
    .run();
};

module.exports = {
  onStart,
};
