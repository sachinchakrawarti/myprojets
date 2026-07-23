/**
 * SQLite Connection
 */

import Database from "better-sqlite3";
import config from "./config.js";

const db = new Database(config.database);

export default db;