const currentUser = checkAuth();

let allEntries = [];
let projectsList = [];
let editingEntryId = null;

const tableBody = document.querySelector("table tbody") || document.querySelector("table");
const searchInput = document.getElementById("searchProject");
const dateFilterInput = document.getElementById("filterDate");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editProjectSelect = document.getElementById("editProjectId");
const editDateInput = document.getElementById("editWorkDate");
const editHoursInput = document.getElementById("editHoursWorked");
const editDescInput = document.getElementById("editDescription");
const closeModalBtn = document.getElementById("closeModalBtn");

const today = new Date().toISOString().split("T")[0];
if (editDateInput) {
    editDateInput.setAttribute("max", today);
}

async function fetchProjects() {
    try {
        const response = await fetch("/projects");
        const data = await response.json();
        if (response.ok) {
            projectsList = data;
            if (editProjectSelect) {
                editProjectSelect.innerHTML = '<option value="">Select Project</option>';
                projectsList.forEach(p => {
                    const option = document.createElement("option");
                    option.value = p.project_id;
                    option.textContent = p.project_name;
                    editProjectSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error("Error loading projects:", error);
    }
}

async function loadTimeEntries() {
    try {
        const search = searchInput ? searchInput.value.trim() : "";
        const date = dateFilterInput ? dateFilterInput.value : "";

        let url = `/timeentry?userId=${currentUser.user_id}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        if (date) {
            url += `&date=${encodeURIComponent(date)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            allEntries = data;
            renderEntries();
        }
    } catch (error) {
        console.error("Error loading time entries:", error);
    }
}

function renderEntries() {
    const table = document.querySelector("table");
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Hours</th>
                <th>Description</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody id="entriesTableBody">
        </tbody>
    `;

    const tbody = document.getElementById("entriesTableBody");

    if (allEntries.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">No matching time entries found.</td>
            </tr>
        `;
        return;
    }

    allEntries.forEach(entry => {
        const row = document.createElement("tr");

        const dateFormatted = new Date(entry.work_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        row.innerHTML = `
            <td>${dateFormatted}</td>
            <td style="font-weight: bold;">${entry.project_name}</td>
            <td>${entry.hours_worked} hrs</td>
            <td>${entry.work_description || entry.task_description || ""}</td>
            <td>
                <button class="edit" onclick="openEditModal(${entry.entry_id})">Edit</button>
                <button class="delete" onclick="deleteEntry(${entry.entry_id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function deleteEntry(id) {
    if (!confirm("Are you sure you want to delete this time entry?")) {
        return;
    }

    try {
        const response = await fetch(`/timeentry/${id}`, {
            method: "DELETE"
        });
        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Entry deleted successfully.");
            loadTimeEntries();
        } else {
            alert(data.message || "Failed to delete entry.");
        }
    } catch (error) {
        console.error("Error deleting entry:", error);
        alert("Server communication failure.");
    }
}

async function openEditModal(id) {
    const entry = allEntries.find(e => e.entry_id === id);
    if (!entry) return;

    editingEntryId = id;
    editProjectSelect.value = entry.project_id;
    editDateInput.value = entry.work_date.split("T")[0];
    editHoursInput.value = entry.hours_worked;
    editDescInput.value = entry.work_description || entry.task_description || "";

    editModal.style.display = "block";
}

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
        editModal.style.display = "none";
        editingEntryId = null;
    });
}

if (editForm) {
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!editingEntryId) return;

        try {
            const response = await fetch(`/timeentry/${editingEntryId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    project_id: editProjectSelect.value,
                    work_date: editDateInput.value,
                    hours_worked: editHoursInput.value,
                    work_description: editDescInput.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || "Entry updated successfully.");
                editModal.style.display = "none";
                editingEntryId = null;
                loadTimeEntries();
            } else {
                alert(data.message || "Failed to update entry.");
            }
        } catch (error) {
            console.error("Error updating entry:", error);
            alert("Server communication error.");
        }
    });
}

if (searchInput) {
    searchInput.addEventListener("input", loadTimeEntries);
}
if (dateFilterInput) {
    dateFilterInput.addEventListener("change", loadTimeEntries);
}

if (currentUser) {
    fetchProjects().then(() => {
        loadTimeEntries();
    });
}
