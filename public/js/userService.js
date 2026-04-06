//js/userService.js
export async function getCurrentUser() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const res = await fetch("/api/auth/me", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) throw new Error("Invalid token");

    const user = await res.json();

    console.log("User from /me:", user); // 👈 DEBUG

    return user;

  } catch (err) {
    console.log("User fetch failed:", err.message);
    return null;
  }
}