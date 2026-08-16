const pool = require("../database/db");

exports.createTimeEntry = async (req, res) => {
    try {
        const {
            project_id,
            user_id,
            work_date,
            hours_worked,
            work_description,
            task_description
        } = req.body;

        const description = work_description || task_description;

        if (!project_id || !user_id || !work_date || !hours_worked || !description) {
            return res.status(400).json({
                message: "Please fill in all required fields (Project, Date, Hours, Description)."
            });
        }

        const hours = parseFloat(hours_worked);
        if (isNaN(hours) || hours <= 0 || hours > 24) {
            return res.status(400).json({
                message: "Please enter a valid number of hours worked (between 0.01 and 24.00)."
            });
        }

        // Check that date is not in the future
        const selectedDate = new Date(work_date);
        const today = new Date();
        selectedDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);

        if (selectedDate > today) {
            return res.status(400).json({
                message: "You cannot record time entries for future dates."
            });
        }

        const result = await pool.query(
            `INSERT INTO time_entries (project_id, user_id, work_date, hours_worked, work_description)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [project_id, user_id, work_date, hours, description]
        );

        res.status(201).json({
            message: "Time entry added successfully",
            timeEntry: result.rows[0]
        });
    } catch (error) {
        console.error("Error creating time entry:", error);
        res.status(500).json({
            message: "Server Error: " + error.message
        });
    }
};

exports.getTimeEntries = async (req, res) => {
    try {
        const { userId, search, date } = req.query;
        
        let query = `
            SELECT t.entry_id, t.user_id, t.project_id, t.work_date, t.hours_worked, t.work_description,
                   p.project_name, u.full_name as employee_name
            FROM time_entries t
            JOIN projects p ON t.project_id = p.project_id
            JOIN users u ON t.user_id = u.user_id
            WHERE 1=1
        `;
        const queryParams = [];

        if (userId) {
            queryParams.push(userId);
            query += ` AND t.user_id = $${queryParams.length}`;
        }

        if (search) {
            queryParams.push(`%${search}%`);
            query += ` AND p.project_name ILIKE $${queryParams.length}`;
        }

        if (date) {
            queryParams.push(date);
            query += ` AND t.work_date = $${queryParams.length}`;
        }

        query += " ORDER BY t.work_date DESC, t.entry_id DESC";

        const result = await pool.query(query, queryParams);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching time entries:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

exports.updateTimeEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            project_id,
            work_date,
            hours_worked,
            work_description,
            task_description
        } = req.body;

        const description = work_description || task_description;

        if (!project_id || !work_date || !hours_worked || !description) {
            return res.status(400).json({
                message: "Please fill in all required fields."
            });
        }

        const hours = parseFloat(hours_worked);
        if (isNaN(hours) || hours <= 0 || hours > 24) {
            return res.status(400).json({
                message: "Please enter a valid number of hours worked."
            });
        }

        const selectedDate = new Date(work_date);
        const today = new Date();
        selectedDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);

        if (selectedDate > today) {
            return res.status(400).json({
                message: "You cannot record time entries for future dates."
            });
        }

        const result = await pool.query(
            `UPDATE time_entries
             SET project_id = $1,
                 work_date = $2,
                 hours_worked = $3,
                 work_description = $4
             WHERE entry_id = $5
             RETURNING *`,
            [project_id, work_date, hours, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Time entry not found"
            });
        }

        res.status(200).json({
            message: "Time entry updated successfully",
            timeEntry: result.rows[0]
        });
    } catch (error) {
        console.error("Error updating time entry:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

exports.deleteTimeEntry = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM time_entries WHERE entry_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Time entry not found"
            });
        }

        res.status(200).json({
            message: "Time entry deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting time entry:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

exports.getReports = async (req, res) => {
    try {
        const { userId } = req.query;

        let reportsQuery = `
            SELECT t.entry_id, t.user_id, t.work_date, t.hours_worked, t.work_description,
                   p.project_name, u.full_name as employee_name
            FROM time_entries t
            JOIN projects p ON t.project_id = p.project_id
            JOIN users u ON t.user_id = u.user_id
            WHERE 1=1
        `;
        const queryParams = [];

        if (userId) {
            queryParams.push(userId);
            reportsQuery += ` AND t.user_id = $${queryParams.length}`;
        }

        reportsQuery += " ORDER BY t.work_date DESC";

        const entriesResult = await pool.query(reportsQuery, queryParams);

        let totalHoursQuery = "SELECT SUM(hours_worked) as total_hours, COUNT(DISTINCT project_id) as project_count FROM time_entries WHERE 1=1";
        const hoursParams = [];

        if (userId) {
            hoursParams.push(userId);
            totalHoursQuery += " AND user_id = $1";
        }

        const totalHoursResult = await pool.query(totalHoursQuery, hoursParams);

        res.status(200).json({
            entries: entriesResult.rows,
            totalHours: parseFloat(totalHoursResult.rows[0].total_hours || 0),
            projectCount: parseInt(totalHoursResult.rows[0].project_count || 0)
        });
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};
