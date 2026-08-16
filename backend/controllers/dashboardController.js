const pool = require("../database/db");

// Get Dashboard Data (Dynamic stats for Admin or Team Member)
exports.getDashboardData = async (req, res) => {
    try {
        const { userId, role } = req.query;

        if (role === "Administrator" || role === "Admin") {
            // Admin Statistics
            const projectsResult = await pool.query("SELECT COUNT(*) FROM projects");
            const usersResult = await pool.query("SELECT COUNT(*) FROM users WHERE role != 'Administrator'");
            const hoursResult = await pool.query("SELECT SUM(hours_worked) FROM time_entries");

            res.status(200).json({
                totalProjects: parseInt(projectsResult.rows[0].count || 0),
                totalEmployees: parseInt(usersResult.rows[0].count || 0),
                totalHours: parseFloat(hoursResult.rows[0].sum || 0)
            });
        } else {
            // Team Member / Employee Statistics
            const projectsResult = await pool.query("SELECT COUNT(*) FROM projects");
            
            // Today's logged hours (Must Have/Should Have)
            const todayQuery = await pool.query(
                "SELECT SUM(hours_worked) FROM time_entries WHERE user_id = $1 AND work_date = CURRENT_DATE",
                [userId]
            );

            // This week's logged hours (Current week start from Monday)
            const weekQuery = await pool.query(
                `SELECT SUM(hours_worked) FROM time_entries 
                 WHERE user_id = $1 
                 AND work_date >= DATE_TRUNC('week', CURRENT_DATE)`,
                [userId]
            );

            res.status(200).json({
                totalProjects: parseInt(projectsResult.rows[0].count || 0),
                todayHours: parseFloat(todayQuery.rows[0].sum || 0),
                weekHours: parseFloat(weekQuery.rows[0].sum || 0)
            });
        }
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};
