/**
 * Database Configuration
 */

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

/*
Project Structure

ethereum/
│
├── database/
│   └── ethereum.db
│
└── api/
    └── historical/
        └── database/
            └── config.js
*/

const DATABASE_PATH = path.resolve(
    __dirname,
    "../../../database/ethereum.db"
);

export default {

    DATABASE_PATH

};