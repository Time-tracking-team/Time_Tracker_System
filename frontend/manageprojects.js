const currentUser = checkAuth("Administrator");

const projectForm = document.getElementById("projectForm");

projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const project_name = document.getElementById("projectName").value.trim();
    const description = document.getElementById("description").value.trim();
    const start_date = document.getElementById("startDate").value;
    const end_date = document.getElementById("endDate").value;
    const projectId = document.getElementById("projectId").value;

    try {
        const response = await fetch(projectId
            ? `/projects/${projectId}`
            : "/projects",
            {
                method: projectId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    project_name,
                    description,
                    start_date,
                    end_date,
                    status: "Ongoing"
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            projectForm.reset();
            loadProjects();
            document.getElementById("projectId").value = "";
            document.getElementById("saveButton").textContent = "Save Project";
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Unable to connect to server.");
    }
});

async function loadProjects() {
    try {
        const response = await fetch("/projects");
        const projects = await response.json();

        const tableBody = document.getElementById("projectTableBody");
        tableBody.innerHTML = "";

        if (projects.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No projects registered yet.</td></tr>`;
            return;
        }

        projects.forEach(project => {
            const startFormatted = project.start_date ? new Date(project.start_date).toLocaleDateString("en-GB") : "N/A";
            const endFormatted = project.end_date ? new Date(project.end_date).toLocaleDateString("en-GB") : "N/A";
            tableBody.innerHTML += `
                <tr>
                    <td>${project.project_name}</td>
                    <td>${project.description || "No description"}</td>
                    <td>${startFormatted}</td>
                    <td>${endFormatted}</td>
                    <td>
                        <button class="edit" onclick="editProject(${project.project_id})">Edit</button>
                        <button class="delete" onclick="deleteProject(${project.project_id})">Delete</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error(error);
    }
}

async function deleteProject(id) {
    if (!confirm("Are you sure you want to delete this project?")) {
        return;
    }

    try {
        const response = await fetch(`/projects/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();
        alert(data.message);
        loadProjects();

    } catch (error) {
        console.error(error);
        alert("Unable to delete project.");
    }
}

async function editProject(id) {
    try {
        const response = await fetch(`/projects/${id}`);
        const project = await response.json();

        document.getElementById("projectId").value = project.project_id;
        document.getElementById("projectName").value = project.project_name;
        document.getElementById("description").value = project.description || "";
        document.getElementById("startDate").value = project.start_date ? project.start_date.split("T")[0] : "";
        document.getElementById("endDate").value = project.end_date ? project.end_date.split("T")[0] : "";

        document.getElementById("saveButton").textContent = "Update Project";

    } catch (error) {
        console.error(error);
        alert("Unable to load project details.");
    }
}

if (currentUser) {
    loadProjects();
}
