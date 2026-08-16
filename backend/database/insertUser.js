const pool = require("./db");

async function insertUser() {
    try {
        const result = await pool.query(
            `INSERT INTO users (name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                "Vishakha",
                "vishakha@gmail.com",
                "12345",
                "Employee"
            ]
        );

        console.log("User inserted successfully!");
        console.log(result.rows[0]);

    } catch (error) {
        console.error("Error inserting user:", error);
    } finally {
        pool.end();
    }
}

insertUser();