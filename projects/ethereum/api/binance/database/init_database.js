const fs = require("fs");
const path = require("path");

const connect = require("./connection");


async function initDatabase(){

    const db = await connect();


    const schemaPath = path.join(
        __dirname,
        "../../../database/schema/0003_ohlcv.sql"
    );


    const schema = fs.readFileSync(
        schemaPath,
        "utf8"
    );


    await db.exec(schema);


    console.log(
        "Database schema initialized"
    );

}


initDatabase()
.catch(console.error);