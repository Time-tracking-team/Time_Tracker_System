const currentUser = checkAuth();

let allProjects = [];

const projectsContainer = document.querySelector(".projects");
const searchInput = document.getElementById("searchProject");
const statusFilter = document.getElementById("statusFilter");

async function loadProjects() {
    try {
        const response = await fetch("/projects");
        const data = await response.json();

        if (response.ok) {
            allProjects = data;
            renderProjects();
        }
    } catch (error) {
        console.error("Error fetching projects:", error);
    }
}

function renderProjects() {
    if (!projectsContainer) return;

    projectsContainer.innerHTML = "";

    const search = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const status = statusFilter ? statusFilter.value : "All";

    const filtered = allProjects.filter(project => {
        const matchesSearch = project.project_name.toLowerCase().includes(search) || 
                              (project.description && project.description.toLowerCase().includes(search));
        
        const matchesStatus = status === "All" || 
                              (project.status && project.status.toLowerCase() === status.toLowerCase());

        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        projectsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666; font-size: 16px; margin-top: 20px;">No projects found matching the criteria.</p>`;
        return;
    }

    filtered.forEach(project => {
        const card = document.createElement("div");
        card.className = "project-card";

        const endDateFormatted = project.end_date 
            ? new Date(project.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : "N/A";

        card.innerHTML = `
            <h3>${project.project_name}</h3>
            <p>${project.description || "No description provided."}</p>
            <p><strong>Deadline:</strong> ${endDateFormatted}</p>
            <p><strong>Status:</strong> <span class="status-badge" style="background: ${getStatusColor(project.status)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${project.status || "Ongoing"}</span></p>
            <button onclick="alert('Project Details:\\n\\nName: ${project.project_name}\\nDescription: ${project.description || 'None'}\\nDeadline: ${endDateFormatted}\\nStatus: ${project.status || 'Ongoing'}')">View Details</button>
        `;
        projectsContainer.appendChild(card);
    });
}

function getStatusColor(status) {
    switch (String(status).toLowerCase()) {
        case "completed": return "#28a745";
        case "ongoing": return "#007bff";
        case "pending": return "#ffc107";
        default: return "#6c757d";
    }
}

if (searchInput) {
    searchInput.addEventListener("input", renderProjects);
}
if (statusFilter) {
    statusFilter.addEventListener("change", renderProjects);
}

if (currentUser) {
    loadProjects();
}
