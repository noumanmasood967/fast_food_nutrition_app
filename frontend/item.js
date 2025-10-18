const backendUrl = "";

document.getElementById("backBtn").addEventListener("click", () => {
    window.history.back();
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    const val = urlParams.get(param);
    return val && val.trim() !== "" && val !== "undefined" ? val : null;
}

function formatNutritionValue(value) {
    if (value === null || value === undefined || value === "N/A") return "N/A";
    // Ensure the value can be parsed as a float before fixing to 1 decimal place
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toFixed(1);
}

async function fetchFoodDetails(id) {
    try {
        // Show loading state
        document.getElementById("itemName").textContent = "Loading...";

        // FIX: MUST include the /api prefix for Netlify to correctly proxy the request
        const res = await fetch(`${backendUrl}/api/item?id=${encodeURIComponent(id)}`);
        
        if (!res.ok) throw new Error("Failed to fetch food details");
        const item = await res.json();

        // Update all fields with formatted values
        document.getElementById("itemName").textContent = item.name || "N/A";
        document.getElementById("serving_size").textContent = item.serving_size || "N/A";
        document.getElementById("calories").textContent = item.calories || "N/A";
        document.getElementById("total_fat").textContent = formatNutritionValue(item.total_fat);
        document.getElementById("saturated_fat").textContent = formatNutritionValue(item.saturated_fat);
        document.getElementById("trans_fat").textContent = formatNutritionValue(item.trans_fat);
        document.getElementById("cholesterol").textContent = item.cholesterol || "N/A";
        document.getElementById("sodium").textContent = item.sodium || "N/A";
        document.getElementById("carbohydrates").textContent = formatNutritionValue(item.carbohydrates);
        document.getElementById("sugars").textContent = formatNutritionValue(item.sugars);
        document.getElementById("protein").textContent = formatNutritionValue(item.protein);
    } catch (err) {
        document.getElementById("itemName").textContent = "Error Loading Item";
        console.error("Error fetching food details:", err);

        // Show error message
        const errorDiv = document.createElement('div');
        // Note: Assumes you have Tailwind CSS or similar utility classes available
        errorDiv.className = 'fixed bottom-4 left-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50';
        errorDiv.innerHTML = `
          <div class="flex items-center">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            <span>Failed to load food details. Please try again.</span>
          </div>
        `;
        document.body.appendChild(errorDiv);

        // Remove error message after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

const itemId = getQueryParam("id");
if (!itemId) {
    // Show error state
    document.getElementById("itemName").textContent = "Invalid Item";

    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed bottom-4 left-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50';
    errorDiv.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        <span>No valid item ID provided.</span>
      </div>
    `;
    document.body.appendChild(errorDiv);
} else {
    fetchFoodDetails(itemId);
}

// Add touch feedback for mobile
document.addEventListener('touchstart', function() {}, {passive: true});

// Prevent zoom on double-tap for better mobile experience
document.addEventListener('touchend', function(e) {
    if (e.touches && e.touches.length < 2) {
        return;
    }
    e.preventDefault();
}, { passive: false });