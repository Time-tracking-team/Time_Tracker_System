const currentUser = checkAuth();

const form = document.getElementById("timeEntryForm");
const projectSelect = document.getElementById("projectId");
const dateInput = document.getElementById("workDate");

const today = new Date().toISOString().split("T")[0];
dateInput.setAttribute("max", today);

async function loadProjects() {
    try {
        const response = await fetch("/projects");
        const projects = await response.json();

        if (response.ok) {
            projectSelect.innerHTML = '<option value="">Select Project</option>';
            projects.forEach(project => {
                const option = document.createElement("option");
                option.value = project.project_id;
                option.textContent = project.project_name;
                projectSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error loading projects:", error);
    }
}

if (currentUser) {
    loadProjects();
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const project_id = projectSelect.value;
    const work_date = dateInput.value;
    const hours_worked = document.getElementById("hoursWorked").value;
    const work_description = document.getElementById("taskDescription").value;

    try {
        const response = await fetch("/timeentry", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                project_id,
                user_id: currentUser.user_id,
                work_date,
                hours_worked,
                work_description
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Time entry saved successfully.");
            form.reset();
        } else {
            alert(data.message || "Error saving time entry.");
        }

    } catch (error) {
        console.error(error);
        alert("Unable to save time entry. Server connection failure.");
    }
});
