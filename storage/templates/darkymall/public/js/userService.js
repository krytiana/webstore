//public/js/userService.js
export async function getCurrentUser() {
  try {
    const res = await fetch("/api/users/profile", {
      credentials: "include" // 🔥 sends cookies automatically
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      name: data.username,
      email: data.email
    };

  } catch (err) {
    return null;
  }
}