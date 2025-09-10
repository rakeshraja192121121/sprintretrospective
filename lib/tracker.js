export function trackEvent(type, details = {}) {
  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      details,
      time: new Date().toISOString(),
    }),
    keepalive: true,
  }).catch(() => {});
}
