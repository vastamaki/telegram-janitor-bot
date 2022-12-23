import SQLite from "better-sqlite3";
export const sql = new SQLite(`/db/data.sqlite`);

export const saveToDb = (data, table) => {
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

export const removeFromDb = (table, search_condition) => {
  const sqlQuery = `DELETE FROM ${table} WHERE ${search_condition}`;
  sql.prepare(sqlQuery).run();
};

export const getPendingUser = (userId, chatId) => {
  return sql
    .prepare(`SELECT * FROM pendingUsers WHERE userId = ? and chatId = ?`)
    .get(userId, chatId);
};

export const getAllUsersOlderThan5Minutes = () => {
  return sql
    .prepare(
      `SELECT * FROM pendingUsers WHERE timestamp <= Datetime('now', '-5 minutes', 'localtime')`
    )
    .all();
};
