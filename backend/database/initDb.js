const pool = require("./db");

async function initDb() {
    try {
        console.log("Initializing database tables...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL
            );
        `);
        console.log("Users table verified.");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS projects (
                project_id SERIAL PRIMARY KEY,
                project_name VARCHAR(100) NOT NULL,
                description TEXT,
                start_date DATE,
                end_date DATE,
                status VARCHAR(20) DEFAULT 'Ongoing'
            );
        `);
        console.log("Projects table verified.");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS time_entries (
                entry_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
                work_date DATE NOT NULL,
                hours_worked DECIMAL(4,2) NOT NULL,
                work_description TEXT NOT NULL
            );
        `);
        console.log("Time entries table verified.");

        console.log("Seeding default users...");
        
        await pool.query(`
            INSERT INTO users (full_name, email, password, role)
            VALUES ('Vishakha', 'vishakha@gmail.com', '12345', 'Team Member')
            ON CONFLICT (email) DO UPDATE 
            SET full_name = 'Vishakha', password = '12345', role = 'Team Member';
        `);

        await pool.query(`
            INSERT INTO users (full_name, email, password, role)
            VALUES ('Harsh', 'harsh@gmail.com', '12345', 'Administrator')
            ON CONFLICT (email) DO UPDATE 
            SET full_name = 'Harsh', password = '12345', role = 'Administrator';
        `);
        
        console.log("Pre-seeded accounts created successfully.");

        console.log("Database initialized successfully!");
    } catch (err) {
        console.error("Error initializing database:", err);
    } finally {
        if (require.main === module) {
            await pool.end();
        }
    }
}

if (require.main === module) {
    initDb();
} else {
    module.exports = initDb;
}
