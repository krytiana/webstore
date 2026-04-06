//js/login.js
import { getCurrentUser } from "./userService.js";

const userSection = document.getElementById("userSection");

async function init() {
  const user = await getCurrentUser();

  if (user && user.name) {
    userSection.innerHTML = `
      <span>Hi, ${user.name}</span>
      <a href="/dashboard" style="margin-left:10px;">Dashboard</a>
      
    `;

    document.getElementById("logoutBtn").addEventListener("click", logout);

  } else {
    showGuest();
  }
}

function showGuest() {
  userSection.innerHTML = `
    <a href="/register">Login</a>
    <a href="/register">Register</a>
  `;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  location.reload();
}

init();