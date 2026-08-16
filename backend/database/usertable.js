const pool = require("./db");

async function createUsersTable() {
    try {
        await pool.query(`
            CREATE TABLE If NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL,
                role VARCHAR(20) NOT NULL
            );
        `);

        console.log("Users table created successfully!");
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

createUsersTable();