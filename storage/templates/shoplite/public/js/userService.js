//public/js/userService.js
export async function getCurrentUser() {
  try {
    const res = await fetch("/api/users/profile", {
      credentials: "include" // 🔥 sends cookies automatically
    });

    if (!res.ok) return null;

    const data = await res.json();

    console.log("User from profile:", data);

    return {
      name: data.username,
      email: data.email
    };

  } catch (err) {
    console.log("User fetch failed:", err.message);
    return null;
  }
}