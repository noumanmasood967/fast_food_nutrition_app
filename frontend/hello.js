// The corrected base URL. Using an empty string makes the browser request 
// from the same host (the Heroku domain) the frontend is being served from.
const backendUrl = ""; 

const countrySelect = document.getElementById("countrySelect");
const branchSection = document.getElementById("branchSection");
const branchContainer = document.getElementById("branchContainer");
const searchSection = document.getElementById("searchSection");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const randomBtn = document.getElementById("randomBtn");
const selectedBranch = document.getElementById("selectedBranch");
const selectedCountry = document.getElementById("selectedCountry");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileNav = document.getElementById("mobileNav");
const closeMobileMenu = document.getElementById("closeMobileMenu");
const backToTop = document.getElementById("backToTop");

let currentCountryId = null;
let currentBranchId = null;
let foodItems = [];

// Logo mapping for known brands
const brandLogos = {
  "burger king": "https://logo.clearbit.com/burgerking.com",
  "dominos": "https://logo.clearbit.com/dominos.com",
  "domino's": "https://logo.clearbit.com/dominos.com",
  "dunkin": "https://logo.clearbit.com/dunkindonuts.com",
  "dunkin'": "https://logo.clearbit.com/dunkindonuts.com",
  "mcdonald": "https://logo.clearbit.com/mcdonalds.com",
  "mcdonald's": "https://logo.clearbit.com/mcdonalds.com",
  "pizza hut": "https://logo.clearbit.com/pizzahut.com",
  "starbucks": "https://logo.clearbit.com/starbucks.com",
  "taco bell": "https://logo.clearbit.com/tacobell.com",
  "wendys": "https://logo.clearbit.com/wendys.com",
  "wendy's": "https://logo.clearbit.com/wendys.com",
  "kfc": "https://logo.clearbit.com/kfc.com",
  "kentucky fried chicken": "https://logo.clearbit.com/kfc.com", 
  "subway": "https://logo.clearbit.com/subway.com"
};

// Initialize countries on page load
async function fetchCountries() {
  try {
    // FIX: Changed from /countries to /api/countries and uses relative backendUrl
    const res = await fetch(`${backendUrl}/api/countries`);
    if (!res.ok) throw new Error(`Failed to fetch countries: ${res.statusText}`);
    const countries = await res.json();

    countrySelect.innerHTML = '<option value="">Select Country</option>';
    countries.forEach(country => {
      const option = document.createElement("option");
      option.value = country.id;
      option.textContent = country.name;
      countrySelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error fetching countries:", err);
    countrySelect.innerHTML = '<option value="">Failed to load countries</option>';
    alert("Failed to load countries. Please try again later.");
  }
}

async function fetchBranches(countryId) {
  try {
    branchContainer.innerHTML = '<div class="col-span-full text-center py-4">Loading branches...</div>';
    
    // FIX: Changed from /branches to /api/branches and uses relative backendUrl
    const res = await fetch(`${backendUrl}/api/branches?country_id=${countryId}`);
    if (!res.ok) throw new Error(`Failed to fetch branches: ${res.statusText}`);
    const branches = await res.json();

    branchContainer.innerHTML = '';
    
    if (branches.length === 0) {
      branchContainer.innerHTML = '<div class="col-span-full text-center py-4">No branches available for this country</div>';
      return;
    }

    branches.forEach(branch => {
      const branchItem = document.createElement("div");
      branchItem.className = "branch-item";
      branchItem.dataset.branchId = branch.id;
      branchItem.dataset.branchName = branch.name;
      
      // Find the appropriate logo
      const branchNameLower = branch.name.toLowerCase();
      let logoUrl = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjQwIiBmaWxsPSIjMDAwIj48dGV4dCB4PSI4MCIgeT0iMTMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiPkJyYW5jaDwvdGV4dD48L3N2Zz4=";
      
      // Check for exact matches first
      if (brandLogos[branchNameLower]) {
        logoUrl = brandLogos[branchNameLower];
      } else {
        // Check for partial matches
        for (const [key, url] of Object.entries(brandLogos)) {
          if (branchNameLower.includes(key)) {
            logoUrl = url;
            break;
          }
        }
      }
      
      branchItem.innerHTML = `
        <img src="${logoUrl}" 
             alt="${branch.name}" 
             class="branch-logo w-16 h-16 rounded-lg object-contain">
        <span class="branch-name">${branch.name}</span>
      `;
      
      branchItem.addEventListener("click", () => {
        // Remove active class from all items
        document.querySelectorAll(".branch-item").forEach(item => {
          item.classList.remove("active");
          item.querySelector(".branch-logo").classList.remove("active");
        });
        
        // Add active class to clicked item
        branchItem.classList.add("active");
        branchItem.querySelector(".branch-logo").classList.add("active");
        
        currentBranchId = branch.id;
        selectedBranch.textContent = branch.name;
        
        // Show search section
        searchSection.classList.remove("hidden");
        
        // Fetch menu items
        fetchItems(currentCountryId, currentBranchId);
      });
      
      branchContainer.appendChild(branchItem);
    });
  } catch (err) {
    console.error("Error fetching branches:", err);
    branchContainer.innerHTML = '<div class="col-span-full text-center py-4">Failed to load branches</div>';
    alert("Failed to load branches. Please try again later.");
  }
}

async function fetchItems(countryId, branchId) {
  try {
    resultsDiv.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="loading-spinner mx-auto mb-4 border-blue-500"></div>
        <p class="text-gray-600">Loading menu items...</p>
      </div>
    `;
    
    // FIX: Changed from /items to /api/items and uses relative backendUrl
    const res = await fetch(`${backendUrl}/api/items?country_id=${countryId}&branch_id=${branchId}`);
    if (!res.ok) throw new Error(`Failed to fetch items: ${res.statusText}`);
    foodItems = await res.json();
    
    displayResults(foodItems);
  } catch (err) {
    console.error("Error fetching items:", err);
    resultsDiv.innerHTML = `
      <div class="col-span-full text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-700 mb-2">Failed to load menu items</h3>
        <p class="text-gray-500">Please try again later</p>
      </div>
    `;
  }
}

function displayResults(items) {
  resultsDiv.innerHTML = "";
  if (items.length === 0) {
    resultsDiv.innerHTML = `
      <div class="col-span-full text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-700 mb-2">No menu items found</h3>
        <p class="text-gray-500">Try adjusting your search term</p>
      </div>
    `;
    return;
  }

  // Food icons for different categories
  const foodIcons = [
    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
    </svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>`
  ];

  items.forEach((item, index) => {
    if (!item.id) return;
    
    // Determine category for styling (cycle through 5 categories)
    const categoryClass = `food-category-${(index % 5) + 1}`;
    const iconIndex = (index % foodIcons.length);
    
    const card = document.createElement("div");
    card.className = `food-card ${categoryClass} rounded-xl p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg cursor-pointer`;
    card.innerHTML = `
      <div class="food-content flex-1 flex flex-col">
        <div class="food-icon">
          ${foodIcons[iconIndex]}
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">${item.name}</h3>
        <p class="text-gray-700 mb-4 flex-1">${item.description || 'Discover nutritional information for this menu item.'}</p>
        <div class="flex items-center justify-between mt-auto">
          <span class="text-sm font-medium text-gray-700">View nutrition details</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    `;
    
    card.addEventListener("click", () => {
      window.location.href = `item.html?id=${encodeURIComponent(item.id)}`;
    });
    
    resultsDiv.appendChild(card);
  });
}

// Event Listeners
randomBtn.addEventListener("click", () => {
  if (foodItems.length > 0) {
    const randomItem = foodItems[Math.floor(Math.random() * foodItems.length)];
    window.location.href = `item.html?id=${encodeURIComponent(randomItem.id)}`;
  } else {
    alert("Please select a country and branch first.");
  }
});

countrySelect.addEventListener("change", () => {
  currentCountryId = countrySelect.value;
  const countryName = countrySelect.options[countrySelect.selectedIndex].text;
  
  if (currentCountryId) {
    branchSection.classList.remove("hidden");
    selectedCountry.textContent = countryName;
    fetchBranches(currentCountryId);
  } else {
    branchSection.classList.add("hidden");
    searchSection.classList.add("hidden");
  }
});

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filtered = foodItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm)
  );
  displayResults(filtered);
});

// Mobile menu functionality
mobileMenuBtn.addEventListener("click", () => {
  mobileNav.classList.add("open");
});

closeMobileMenu.addEventListener("click", () => {
  mobileNav.classList.remove("open");
});

// Close mobile menu when clicking on a link
document.querySelectorAll('#mobileNav a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove("open");
  });
});

// Back to top functionality
window.addEventListener("scroll", () => {
  if (window.pageYOffset > 300) {
    backToTop.classList.add("visible");
  } else {
    backToTop.classList.remove("visible");
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Initialize countries on page load
fetchCountries();