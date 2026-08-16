const pool = require("../database/db");

// Get all projects
exports.getProjects = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM projects");

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM projects WHERE project_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Project not found"
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

// Create a new project
exports.createProject = async (req, res) => {
    try {
        const {
            project_name,
            description,
            start_date,
            end_date
        } = req.body;

        const result = await pool.query(
            `INSERT INTO projects
            (project_name, description, start_date, end_date)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                project_name,
                description,
                start_date,
                end_date
            ]
        );

        res.status(201).json({
            message: "Project created successfully",
            project: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Update project
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            project_name,
            description,
            start_date,
            end_date
        } = req.body;

        const result = await pool.query(
            `UPDATE projects
             SET project_name = $1,
                 description = $2,
                 start_date = $3,
                 end_date = $4
             WHERE project_id = $5
             RETURNING *`,
            [
                project_name,
                description,
                start_date,
                end_date,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.status(200).json({
            message: "Project updated successfully",
            project: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Delete project
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM projects WHERE project_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.status(200).json({
            message: "Project deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};