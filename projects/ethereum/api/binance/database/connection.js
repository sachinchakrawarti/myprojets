const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db = null;


async function connect() {

    if (db) {
        return db;
    }


    const databasePath = path.join(
        __dirname,
        "../../../database/ethereum.db"
    );


    console.log(
        "Database Path:",
        databasePath
    );


    db = await open({

        filename: databasePath,

        driver: sqlite3.Database

    });


    console.log("SQLite Connected");


    return db;
}


module.exports = connect;