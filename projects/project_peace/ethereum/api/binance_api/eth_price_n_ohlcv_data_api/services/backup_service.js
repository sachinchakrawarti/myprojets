/**
 * Backup SQLite Database
 */

const fs = require("fs");
const path = require("path");

async function backupDatabase() {

    const source = path.join(

        __dirname,
        "../../../../database/ethereum.db"

    );

    const destination = path.join(

        __dirname,
        "../../../../database/backups",
        `ethereum_${Date.now()}.db`

    );

    fs.copyFileSync(source, destination);

    console.log("Database backup completed.");
}

module.exports = backupDatabase;