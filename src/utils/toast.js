// Minimal toast helper to avoid external deps.
// In a real app, swap these for a UI toaster (e.g., react-hot-toast/sonner).
const notify = (prefix, message) => {
  const text = message || "Something went wrong";
  if (typeof window !== "undefined" && window.alert) {
    window.alert(`${prefix}${text}`);
  } else {
    console.log(`${prefix}${text}`);
  }
};

export const toast = {
  success: msg => notify("✅ ", msg),
  error: msg => notify("❌ ", msg),
  info: msg => notify("ℹ️ ", msg),
};

export default toast;
