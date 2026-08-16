const pool = require("./db");

async function createProjectsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS projects (
                project_id SERIAL PRIMARY KEY,
                project_name VARCHAR(100) NOT NULL,
                description TEXT,
                start_date DATE,
                end_date DATE,
                status VARCHAR(20)
            );
        `);

        console.log("Projects table created successfully!");
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

createProjectsTable();