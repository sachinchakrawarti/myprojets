/**
 * SQLite Connection
 */

import sqlite3 from "sqlite3";
import { open } from "sqlite";

import config from "./config.js";

let database = null;

/**
 * Get SQLite Connection
 */
export async function getDatabase() {

    if (database) {

        return database;

    }

    database = await open({

        filename: config.DATABASE_PATH,

        driver: sqlite3.Database

    });

    console.log(
        `[SQLite] Connected: ${config.DATABASE_PATH}`
    );

    return database;

}

export default getDatabase;