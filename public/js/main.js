// public/js/main.js

document.addEventListener("DOMContentLoaded", () => {

    /* ========================================
       PAGE PROTECTION
    ======================================== */

    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/index.html";
        return;
    }

    /* ========================================
       ELEMENT REFERENCES
    ======================================== */

    const navLinks = document.querySelectorAll(".sidebar .nav-link");
    const views = document.querySelectorAll(".view");

    const inventoryTableBody = document.getElementById("inventory-table-body");
    const insightsList = document.getElementById("insights-list");

    const totalValueEl = document.getElementById("total-value");
    const criticalAlertsEl = document.getElementById("critical-alerts");
    const totalProductsEl = document.getElementById("total-products");
    const profileButton = document.getElementById("profile-button");

    /* ========================================
       SPA VIEW SWITCHING
    ======================================== */

    const switchView = async (viewId) => {
        // Hide all views
        views.forEach(view => view.classList.add("d-none"));

        // Show selected view
        document.getElementById(viewId).classList.remove("d-none");

        // Update active sidebar
        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.dataset.view === viewId) {
                link.classList.add("active");
            }
        });

        // Load data depending on view
        if (viewId === "dashboard-view") {
            await loadDashboard();
        }

        if (viewId === "inventory-view") {
            await loadInventory();
        }

        if (viewId === "insights-view") {
            await loadInsights();
        }
    };

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            switchView(link.dataset.view);
        });
    });

    /* ========================================
       DASHBOARD LOGIC
    ======================================== */

    const loadDashboard = async () => {
        try {
            const data = await api.getDashboardData();

            totalValueEl.textContent = `$${data.totalInventoryValue.toFixed(2)}`;
            criticalAlertsEl.textContent = data.criticalAlertsCount;
            totalProductsEl.textContent = data.totalProducts;
            profileButton.textContent = data.userName;

        } catch (error) {
            console.error("Dashboard load failed:", error.message);
        }
    };

    /* ========================================
       INVENTORY LOGIC
    ======================================== */

    const loadInventory = async () => {
        try {
            const products = await api.getProducts();
            renderInventory(products);

        } catch (error) {
            console.error("Inventory load failed:", error.message);
        }
    };

    const renderInventory = (products) => {
        inventoryTableBody.innerHTML = "";

        if (!products.length) {
            inventoryTableBody.innerHTML = `
                <tr><td colspan="5" class="text-center">No products found</td></tr>
            `;
            return;
        }

        products.forEach(product => {

            const status = product.expiryStatus || "Safe";

            const badgeClass =
                status === "Expired"
                    ? "bg-danger"
                    : status === "Warning"
                    ? "bg-warning text-dark"
                    : "bg-success";

            const row = `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>$${product.price}</td>
                    <td><span class="badge ${badgeClass}">${status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-2"
                            onclick="handleSell('${product._id}')">
                            Sell
                        </button>
                        <button class="btn btn-sm btn-outline-secondary"
                            onclick="handleRestock('${product._id}')">
                            Restock
                        </button>
                    </td>
                </tr>
            `;

            inventoryTableBody.innerHTML += row;
        });
    };

    /* ========================================
       SELL PRODUCT
    ======================================== */

    window.handleSell = async (id) => {
        const quantity = prompt("Enter quantity to sell:", 1);

        if (!quantity || quantity <= 0) return;

        try {
            await api.sellProduct(id, Number(quantity));
            await loadInventory();
        } catch (error) {
            alert(error.message);
        }
    };

    /* ========================================
       RESTOCK PRODUCT
    ======================================== */

    window.handleRestock = async (id) => {
        const quantity = prompt("Enter quantity to restock:", 1);

        if (!quantity || quantity <= 0) return;

        try {
            await api.restockProduct(id, Number(quantity));
            await loadInventory();
        } catch (error) {
            alert(error.message);
        }
    };

    /* ========================================
       INSIGHTS LOGIC
    ======================================== */

    const loadInsights = async () => {
        try {
            const insights = await api.getInsights();

            insightsList.innerHTML = "";

            if (!insights.length) {
                insightsList.innerHTML = `
                    <li class="list-group-item">
                        No insights available yet.
                    </li>
                `;
                return;
            }

            insights.forEach(item => {
                insightsList.innerHTML += `
                    <li class="list-group-item">
                        <strong>${item.name}:</strong> ${item.suggestion}
                    </li>
                `;
            });

        } catch (error) {
            console.error("Insights load failed:", error.message);
        }
    };

    /* ========================================
       INITIAL LOAD
    ======================================== */

    switchView("dashboard-view");

});