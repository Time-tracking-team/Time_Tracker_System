const pool = require("../database/db");

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const result = await pool.query("SELECT user_id, full_name, email, role FROM users");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "SELECT user_id, full_name, email, role FROM users WHERE user_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;

        if (!full_name || !email || !password || !role) {
            return res.status(400).json({
                message: "Please fill all required fields."
            });
        }

        const result = await pool.query(
            `INSERT INTO users (full_name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING user_id, full_name, email, role`,
            [full_name, email, password, role]
        );

        res.status(201).json({
            message: "User created successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, password, role } = req.body;

        const result = await pool.query(
            `UPDATE users
             SET full_name = $1,
                 email = $2,
                 password = $3,
                 role = $4
             WHERE user_id = $5
             RETURNING user_id, full_name, email, role`,
            [full_name, email, password, role, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User updated successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM users WHERE user_id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password"
            });
        }

        const result = await pool.query(
            "SELECT user_id, full_name, email, role FROM users WHERE email = $1 AND password = $2",
            [email, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            message: "Login Successful",
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};
