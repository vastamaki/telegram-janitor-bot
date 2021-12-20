const SQLite = require("better-sqlite3");
const sql = new SQLite(`./data.sqlite`);

const saveToDb = (data, table) => {
  const keys = Object.keys(data);
  let insert = "";
  Object.keys(data).forEach((i, idx, array) => {
    if (idx === array.length - 1) {
      insert = insert + `'${data[i]}'`;
    } else {
      insert = insert + `'${data[i]}',`;
    }
  });
  const sqlQuery = `INSERT INTO ${table} (${keys.map(
    (key) => `${key}`
  )}) VALUES (${insert})`;
  sql.prepare(sqlQuery).run();
};

const removeFromDb = (table, search_condition) => {
  const sqlQuery = `DELETE FROM ${table} WHERE ${search_condition}`;
  sql.prepare(sqlQuery).run();
};

const getPendingUser = (userId, chatId) => {
  return sql
    .prepare(`SELECT * FROM pendingUsers WHERE userId = ? and chatId = ?`)
    .get(userId, chatId);
};

module.exports = {
  saveToDb,
  getPendingUser,
  removeFromDb,
};
