const currentUser = checkAuth();

if (currentUser) {
    const welcomeHeading = document.querySelector(".welcome h1");
    if (welcomeHeading) {
        welcomeHeading.textContent = `Welcome, ${currentUser.full_name}`;
    }
    loadDashboardData();
}

async function loadDashboardData() {
    try {
        const statsResponse = await fetch(`/dashboard?userId=${currentUser.user_id}&role=${currentUser.role}`);
        const stats = await statsResponse.json();

        if (statsResponse.ok) {
            document.getElementById("projects").textContent = stats.totalProjects || 0;
            document.getElementById("todayHours").textContent = stats.todayHours || 0;
            document.getElementById("weekHours").textContent = stats.weekHours || 0;
        }

        const entriesResponse = await fetch(`/timeentry?userId=${currentUser.user_id}`);
        const entries = await entriesResponse.json();

        if (entriesResponse.ok) {
            const tableSection = document.querySelector(".table-section table");
            if (tableSection) {
                tableSection.innerHTML = `
                    <tr>
                        <th>Date</th>
                        <th>Project</th>
                        <th>Hours</th>
                        <th>Description</th>
                    </tr>
                `;

                const recentEntries = entries.slice(0, 3);
                if (recentEntries.length === 0) {
                    tableSection.innerHTML += `
                        <tr>
                            <td colspan="4" style="text-align: center;">No time entries logged yet.</td>
                        </tr>
                    `;
                } else {
                    recentEntries.forEach(entry => {
                        const dateFormatted = new Date(entry.work_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short"
                        });
                        tableSection.innerHTML += `
                            <tr>
                                <td>${dateFormatted}</td>
                                <td>${entry.project_name}</td>
                                <td>${entry.hours_worked}</td>
                                <td>${entry.work_description || entry.task_description || ""}</td>
                            </tr>
                        `;
                    });
                }
            }
        }

    } catch (error) {
        console.error("Dashboard failed to load:", error);
        alert("Unable to load dashboard data from server.");
    }
}
