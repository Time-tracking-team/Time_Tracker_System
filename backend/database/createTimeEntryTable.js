const pool = require("./db");

const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS time_entries (
                entry_id SERIAL PRIMARY KEY,
                project_id INT REFERENCES projects(project_id) ON DELETE CASCADE,
                user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
                work_date DATE NOT NULL,
                hours_worked DECIMAL(4,2) NOT NULL,
                task_description TEXT
            );
        `);

        console.log("Time Entries table created successfully");
    } catch (error) {
        console.error(error);
    } finally {
        pool.end();
    }
};

createTable();