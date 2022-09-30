
self.addEventListener('install', () => {
    // Skip over the "waiting" lifecycle state, to ensure that our
    // new service worker is activated immediately, even if there's
    // another tab open controlled by our older service worker code.
    self.skipWaiting();
});


self.addEventListener('activate', () => {
    // Optional: Get a list of all the current open windows/tabs under
    // our service worker's control, and force them to reload.
    // This can "unbreak" any open windows/tabs as soon as the new
    // service worker activates, rather than users having to manually reload.
    self.clients.matchAll({
        type: 'window'
    }).then(windowClients => {
        windowClients.forEach((windowClient) => {
            windowClient.navigate(windowClient.url);
        });
    });
});


self.addEventListener('push', function(event) {
    // the event payload MUST be in the form '{"title": "string", "options": {"body":"string", ...}}'
    const notification = event.data.json()
    // Keep the service worker alive until the notification is created.
    event.waitUntil(
        // Show a notification with title and options set by the server
        self.registration.showNotification(notification.title, notification.options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked ', event.notification.title);
    event.notification.close();

    // This looks to see if the target URL is already open and
    // focuses if it is
    if(event.notification.data && typeof event.notification.data === 'object' && 'url' in event.notification.data) {
        const openUrl = event.notification.data.url
        event.waitUntil(clients.matchAll({
            type: "window"
        }).then((clientList) => {
            console.log({clientList, openUrl})
            for (const client of clientList) {
                if (new URL(client.url).pathname === openUrl && 'focus' in client)
                    return client.focus();
            }
            // allow server to send a URL to open when the user clicks the notification
            if (clients.openWindow)
                return clients.openWindow(openUrl);
        }));
    }
});
