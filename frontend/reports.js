const currentUser = checkAuth();

const totalHoursEl = document.querySelector(".cards .card:nth-child(1) h2");
const projectsEl = document.querySelector(".cards .card:nth-child(2) h2");
const averageEl = document.querySelector(".cards .card:nth-child(3) h2");
const tableSection = document.querySelector(".table-section");

async function loadPersonalReport() {
    try {
        const response = await fetch(`/timeentry/reports?userId=${currentUser.user_id}`);
        const data = await response.json();

        if (response.ok) {
            const totalHours = parseFloat(data.totalHours || 0);
            const projectCount = parseInt(data.projectCount || 0);
            
            totalHoursEl.textContent = totalHours.toFixed(2);
            projectsEl.textContent = projectCount;

            const uniqueDates = new Set(data.entries.map(e => e.work_date.split("T")[0]));
            const avgHours = uniqueDates.size > 0 ? (totalHours / uniqueDates.size) : 0;
            averageEl.textContent = avgHours.toFixed(2);

            tableSection.innerHTML = `
                <h2>Detailed Personal Work Report</h2>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr style="background: #4d8be7; color: white;">
                            <th style="padding: 12px;">Employee Name</th>
                            <th style="padding: 12px;">Project</th>
                            <th style="padding: 12px;">Work Date</th>
                            <th style="padding: 12px;">Hours Worked</th>
                            <th style="padding: 12px;">Description</th>
                        </tr>
                    </thead>
                    <tbody id="reportTableBody">
                    </tbody>
                </table>
            `;

            const tbody = document.getElementById("reportTableBody");
            if (data.entries.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 15px;">No logged hours found.</td>
                    </tr>
                `;
            } else {
                data.entries.forEach(entry => {
                    const dateFormatted = new Date(entry.work_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    });
                    tbody.innerHTML += `
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${currentUser.full_name}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center; font-weight: bold;">${entry.project_name}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${dateFormatted}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${entry.hours_worked} hrs</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${entry.work_description || entry.task_description || ""}</td>
                        </tr>
                    `;
                });
            }

        }
    } catch (error) {
        console.error("Error generating personal report:", error);
        alert("Failed to load report data from server.");
    }
}

if (currentUser) {
    loadPersonalReport();
}
