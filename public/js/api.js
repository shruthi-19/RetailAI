// public/js/api.js

const API_BASE = window.location.origin + "/api";

/* ========================================
   HELPER FUNCTION (Auto attach token)
======================================== */

const request = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const headers = {
        ...(token && { Authorization: `Bearer ${token}` })
    };

    // Only attach JSON header if body exists
    if (options.body) {
        headers["Content-Type"] = "application/json";
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);

        // Handle expired token
        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/index.html";
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "API request failed");
        }

        return data;

    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

/* ========================================
   AUTH APIs
======================================== */

const login = (email, password) =>
    request("/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });

const signup = (name, email, password) =>
    request("/users/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
    });

/* ========================================
   PRODUCT APIs
======================================== */

const getProducts = () => request("/products");

const addProduct = (productData) =>
    request("/products", {
        method: "POST",
        body: JSON.stringify(productData)
    });

const sellProduct = (id, quantity = 1) =>
    request(`/products/${id}/sell`, {
        method: "POST",
        body: JSON.stringify({ quantity })
    });

const restockProduct = (id, quantity = 1) =>
    request(`/products/${id}/restock`, {
        method: "POST",
        body: JSON.stringify({ quantity })
    });

/* ========================================
   ALERTS & DASHBOARD
======================================== */

const getAlerts = () => request("/products/alerts");

const getDashboardData = () => request("/dashboard");

/* ========================================
   INSIGHTS
======================================== */

const getInsights = () => request("/insights");

/* ========================================
   EXPORT GLOBAL API OBJECT
======================================== */

window.api = {
    login,
    signup,
    getProducts,
    addProduct,
    sellProduct,
    restockProduct,
    getAlerts,
    getDashboardData,
    getInsights
};