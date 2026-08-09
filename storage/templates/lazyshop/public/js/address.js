//
const API = "/api/address";


// Elements
const addressList = document.getElementById("addressList");
const form = document.getElementById("addressForm");
const emptyState = document.getElementById("emptyState");

// Inputs
const fullName = document.getElementById("fullName");
const phone = document.getElementById("phone");
const addressLine = document.getElementById("addressLine");
const city = document.getElementById("city");
const region = document.getElementById("region");
const country = document.getElementById("country");

// Modal
const modal = document.getElementById("addressModal");
const addBtn = document.getElementById("addAddressBtn");
const closeModal = document.getElementById("closeModal");
const mapInfo = document.getElementById("mapInfo");

// ----------------------
// 🪟 MODAL CONTROL
// ----------------------
addBtn.onclick = () => {
  modal.style.display = "block";
  setTimeout(() => map.invalidateSize(), 200);
};

closeModal.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

// ----------------------
// 📄 LOAD ADDRESSES
// ----------------------
async function loadAddresses() {
  try {
    const res = await fetch(API, {
      credentials: "include"
    });
    const data = await res.json();

    addressList.innerHTML = "";
   const addresses = Array.isArray(data)
    ? data
    : data.addresses || [];

    if (addresses.length === 0) {
      emptyState.style.display = "block";
      return;

    } else emptyState.style.display = "none";

    addresses.forEach(addr => {
      const div = document.createElement("div");
      div.className = "card " + (addr.isDefault ? "default" : "");
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between;">
          <strong>${addr.fullName}</strong>
          ${addr.isDefault ? "<span style='color:green;'>Default</span>" : ""}
        </div>
        <small>${addr.phone}</small><br>
        <p style="margin:5px 0;">
          ${addr.addressLine}, ${addr.city}<br>
          ${addr.region}, ${addr.country}
        </p>
        <div>
          ${!addr.isDefault ? `<button onclick="setDefault('${addr._id}')">Set Default</button>` : ""}
          <button onclick="deleteAddress('${addr._id}')">Delete</button>
        </div>
      `;
      addressList.appendChild(div);
    });

  } catch (err) { console.error("Error loading addresses:", err); }
}

// ----------------------
// ➕ ADD ADDRESS
// ----------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!selectedLat || !selectedLng) {
    alert("Please select your location on the map");
    return;
  }

  try {
    const body = {
      fullName: fullName.value,
      phone: phone.value,
      addressLine: addressLine.value,
      city: city.value,
      region: region.value,
      country: country.value,
      latitude: selectedLat,
      longitude: selectedLng
    };

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error("Failed to save");

    form.reset();
    modal.style.display = "none";
    loadAddresses();

  } catch (err) { console.error("Error saving address:", err); }
});

// ----------------------
// ❌ DELETE & ⭐ SET DEFAULT
// ----------------------
async function deleteAddress(id) {
  await fetch(API + "/" + id, { 
    method: "DELETE", 
    credentials: "include" });
  loadAddresses();
}

async function setDefault(id) {
  await fetch(API + "/default/" + id, { 
    method: "PUT", 
    credentials: "include" });
  loadAddresses();
}

// ----------------------
// 🗺️ MAP SETUP (Manual Click Only)
// ----------------------
let selectedLat = null, selectedLng = null, marker;

const map = L.map('map').setView([5.6037, -0.1870], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);

// Map click handler
map.on('click', function(e) {
  selectedLat = e.latlng.lat;
  selectedLng = e.latlng.lng;

  if (marker) map.removeLayer(marker);
  marker = L.marker(e.latlng).addTo(map);

  mapInfo.innerText = `Selected: ${selectedLat.toFixed(4)}, ${selectedLng.toFixed(4)}`;
});

// ----------------------
// 🚀 INIT
// ----------------------
loadAddresses();