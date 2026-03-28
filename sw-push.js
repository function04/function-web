// Custom push handler — imported by VitePWA via injectManifest or injected at build time
// This file is loaded alongside the generated Workbox SW

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: "FC Manager",
      body: event.data.text(),
      icon: "/function-web/icon-192.png",
    };
  }

  const { title, body, icon, badge, data, tag } = payload;

  const options = {
    body: body || "",
    icon: icon || "/function-web/icon-192.png",
    badge: badge || "/function-web/favicon.png",
    data: data || {},
    tag: tag || "fc-manager-notification",
    renotify: true,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title || "FC Manager", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  // Default URL — open the dashboard
  let url = "/function-web/";

  if ((data.type === "comment" || data.type === "reply") && data.post_id) {
    url = `/function-web/board?post=${data.post_id}`;
  } else if (data.type === "announcement") {
    url = "/function-web/";
  } else if (data.type === "update") {
    url = "/function-web/updates";
  } else if (data.type === "super_champ") {
    url = "/function-web/leaderboard";
  } else if (data.type === "target_score" || data.type === "target_rank" || data.type === "daily_summary") {
    url = "/function-web/history";
  } else if (data.url) {
    url = data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab if found
      for (const client of windowClients) {
        if (client.url.includes("/function-web") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new tab
      return clients.openWindow(url);
    })
  );
});
