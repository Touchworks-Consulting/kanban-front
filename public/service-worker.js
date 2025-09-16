importScripts("https://js.pusher.com/beams/service-worker.js");

// Service Worker adicional para lidar com notificações push
self.addEventListener('push', function(event) {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();

    // Se for uma notificação do Pusher Beams
    if (data.notification) {
      const options = {
        body: data.notification.body,
        icon: data.notification.icon || '/icon-192x192.png',
        badge: data.notification.badge || '/badge-72x72.png',
        data: data.notification.data,
        tag: data.notification.data?.id || 'notification',
        requireInteraction: false,
        silent: false
      };

      event.waitUntil(
        self.registration.showNotification(data.notification.title, options)
      );
    }
  } catch (error) {
    console.error('Erro ao processar notificação push:', error);
  }
});

// Lidar com cliques na notificação
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // Focar na janela da aplicação se estiver aberta
  event.waitUntil(
    clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === self.registration.scope && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não tiver janela aberta, abrir uma nova
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});