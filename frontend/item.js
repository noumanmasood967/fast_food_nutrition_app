  const backendUrl = "http://localhost:3000";

    document.getElementById("backBtn").addEventListener("click", () => {
      window.history.back();
    });

    function getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      const val = urlParams.get(param);
      return val && val.trim() !== "" && val !== "undefined" ? val : null;
    }

    async function fetchFoodDetails(id) {
      try {
        const res = await fetch(`${backendUrl}/item?id=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error("Failed to fetch food details");
        const item = await res.json();

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
        alert(err.message);
        console.error(err);
      }
    }

    const itemId = getQueryParam("id");
    if (!itemId) {
      alert("No valid item ID provided in the URL");
    } else {
      fetchFoodDetails(itemId);
    }
