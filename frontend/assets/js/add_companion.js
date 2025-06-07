document.addEventListener("DOMContentLoaded", () => {
    const companionContainer = document.getElementById("companions-table-container");
    const addBtn = document.getElementById("add-companion-btn");

    const createCompanionRow = () => {
        const row = document.createElement("div");
        row.className = "companion-row";
        row.innerHTML = `
            <input type="text" placeholder="Full Name" />
            <input type="text" placeholder="Contact Number" />
            <input type="email" placeholder="Email" />
            <input type="number" placeholder="Age" />
            <select>
                <option disabled selected hidden value="">Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
            </select>
            <button class="remove-btn" title="Remove">&#10005;</button>
        `;
        return row;
    };

    // Add new row
    addBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const newRow = createCompanionRow();
        companionContainer.appendChild(newRow);
    });

    // Remove row using event delegation
    companionContainer.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("remove-btn")) {
            e.preventDefault();
            const row = e.target.closest(".companion-row");
            if (row) {
                row.remove();
            }
        }
    });
});
