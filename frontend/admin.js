const currentUser = checkAuth("Administrator");

if (currentUser) {
    const adminHeading = document.querySelector(".container h1");
    if (adminHeading) {
        adminHeading.textContent = `Admin Dashboard - Welcome, ${currentUser.full_name}`;
    }
    loadAdminDashboard();
}

async function loadAdminDashboard() {
    try {
        const statsResponse = await fetch(`/dashboard?role=${currentUser.role}`);
        const stats = await statsResponse.json();

        if (statsResponse.ok) {
            const cardContainer = document.querySelector(".cards");
            if (cardContainer) {
                cardContainer.innerHTML = `
                    <div class="card">
                        <h3>Total Employees</h3>
                        <h2>${stats.totalEmployees || 0}</h2>
                    </div>
                    <div class="card">
                        <h3>Total Projects</h3>
                        <h2>${stats.totalProjects || 0}</h2>
                    </div>
                    <div class="card">
                        <h3>Total Logged Hours</h3>
                        <h2>${parseFloat(stats.totalHours || 0).toFixed(2)}</h2>
                    </div>
                `;
            }
        }

        const reportsResponse = await fetch("/timeentry/reports");
        const reportData = await reportsResponse.json();

        if (reportsResponse.ok) {
            const tableSection = document.querySelector(".table-section");
            if (tableSection) {
                tableSection.innerHTML = `
                    <h2>Employee Summary & Team Reports</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <thead>
                            <tr style="background: #4d8be7; color: white;">
                                <th style="padding: 12px; text-align: center;">Employee</th>
                                <th style="padding: 12px; text-align: center;">Project</th>
                                <th style="padding: 12px; text-align: center;">Date</th>
                                <th style="padding: 12px; text-align: center;">Hours Worked</th>
                                <th style="padding: 12px; text-align: center;">Description</th>
                            </tr>
                        </thead>
                        <tbody id="teamReportsTableBody">
                        </tbody>
                    </table>
                `;

                const tbody = document.getElementById("teamReportsTableBody");
                if (!reportData.entries || reportData.entries.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 15px; color: #666;">No logged hours submitted by the team yet.</td>
                        </tr>
                    `;
                } else {
                    reportData.entries.forEach(entry => {
                        const dateFormatted = new Date(entry.work_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                        });
                        tbody.innerHTML += `
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${entry.employee_name}</td>
                                <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center; font-weight: bold;">${entry.project_name}</td>
                                <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${dateFormatted}</td>
                                <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${entry.hours_worked} hrs</td>
                                <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${entry.work_description || entry.task_description || ""}</td>
                            </tr>
                        `;
                    });
                }
            }
        }
    } catch (error) {
        console.error("Admin Dashboard error:", error);
        alert("Failed to fetch administrator statistics from backend.");
    }
}
