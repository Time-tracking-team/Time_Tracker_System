const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const connectionString = process.env.SESSION_URL;

const pool = new Pool({
    connectionString: connectionString,
    ssl: connectionString && connectionString.includes("sslmode=require") ? { rejectUnauthorized: false } : false
});

module.exports = pool;
