/**
 * SQLite Transactions
 */

const connect = require("./connection");

async function beginTransaction() {

    const db = await connect();

    await db.exec("BEGIN TRANSACTION");

    return db;
}

async function commitTransaction(db) {

    await db.exec("COMMIT");
}

async function rollbackTransaction(db) {

    await db.exec("ROLLBACK");
}

module.exports = {

    beginTransaction,
    commitTransaction,
    rollbackTransaction
};