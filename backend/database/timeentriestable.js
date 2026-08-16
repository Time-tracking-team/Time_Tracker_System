const pool = require("./db");

async function createTimeEntriesTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS time_entries (
                entry_id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                project_id INT NOT NULL,
                work_date DATE NOT NULL,
                hours_worked DECIMAL(4,2) NOT NULL,
                description TEXT,

                FOREIGN KEY (user_id)
                    REFERENCES users(user_id)
                    ON DELETE CASCADE,

                FOREIGN KEY (project_id)
                    REFERENCES projects(project_id)
                    ON DELETE CASCADE
            );
        `);

        console.log("Time Entries table created successfully!");
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

createTimeEntriesTable();