// The corrected base URL. Using an empty string makes the browser request 
// from the same host (the Heroku domain) the frontend is being served from.
const backendUrl = ""; 

document.getElementById("backBtn").addEventListener("click", () => {
    // Uses the browser history to navigate back to the previous page (index.html)
    window.history.back();
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    const val = urlParams.get(param);
    // Check for null, empty string, or "undefined" string
    return val && val.trim() !== "" && val !== "undefined" ? val : null;
}

async function fetchFoodDetails(id) {
    try {
        // FIX: Changed fetch path to use the /api prefix
        const res = await fetch(`${backendUrl}/api/item?id=${encodeURIComponent(id)}`);
        
        if (!res.ok) {
            // Check for specific error status (like 404 Not Found)
            if (res.status === 404) {
                throw new Error("Item not found. The ID may be invalid.");
            }
            throw new Error(`Failed to fetch food details (Status: ${res.status})`);
        }
        
        const item = await res.json();

        // Populate the HTML elements with the fetched data
        document.getElementById("itemName").textContent = item.name || "N/A";
        document.getElementById("serving_size").textContent = item.serving_size || "N/A";
        document.getElementById("calories").textContent = item.calories || "N/A";
        document.getElementById("total_fat").textContent = item.total_fat || "N/A";
        document.getElementById("saturated_fat").textContent = item.saturated_fat || "N/A";
        document.getElementById("trans_fat").textContent = item.trans_fat || "N/A";
        document.getElementById("cholesterol").textContent = item.cholesterol || "N/A";
        document.getElementById("sodium").textContent = item.sodium || "N/A";
        document.getElementById("carbohydrates").textContent = item.carbohydrates || "N/A";
        document.getElementById("sugars").textContent = item.sugars || "N/A";
        document.getElementById("protein").textContent = item.protein || "N/A";
    } catch (err) {
        alert(`Error: ${err.message}`);
        console.error("Fetch Error:", err);
        // Clear item name on error
        document.getElementById("itemName").textContent = "Error Loading Item";
    }
}

const itemId = getQueryParam("id");

if (!itemId) {
    alert("No valid item ID provided in the URL. Returning to the main page.");
    // Optional: Redirect back to index.html if no ID is found
    // window.location.href = "index.html";
} else {
    fetchFoodDetails(itemId);
}