// Service Worker for ShoeStopper PWA
const CACHE_NAME = 'shoestopper-v1';
const STATIC_CACHE = 'shoestopper-static-v1';
const DYNAMIC_CACHE = 'shoestopper-dynamic-v1';

// Files to cache initially
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo.svg',
  '/offline.html'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/products',
  '/api/products/featured',
  '/api/products/filters/options'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      handleApiRequest(request)
    );
    return;
  }

  // Handle static files and navigation requests
  event.respondWith(
    handleStaticRequest(request)
  );
});

// Handle API requests with cache-first strategy for certain endpoints
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const shouldCache = API_CACHE_PATTERNS.some(pattern => 
    url.pathname.includes(pattern)
  );

  if (shouldCache) {
    try {
      // Try cache first
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // Return cached version and update in background
        updateCache(request);
        return cachedResponse;
      }

      // If not in cache, fetch from network
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cache successful responses
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      console.log('API request failed:', error);
      
      // Try to return cached version as fallback
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return error response
      return new Response(
        JSON.stringify({ error: 'Network error, please try again later' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // For non-cacheable API requests, just fetch from network
  return fetch(request);
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Static request failed:', error);
    
    // For navigation requests, return offline page
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline.html');
      return offlineResponse || new Response('Offline', { status: 503 });
    }
    
    // For other requests, try to return cached version
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Background cache update
async function updateCache(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    console.log('Background cache update failed:', error);
  }
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-cart-sync') {
    event.waitUntil(syncCartData());
  }
  
  if (event.tag === 'background-wishlist-sync') {
    event.waitUntil(syncWishlistData());
  }
});

// Sync cart data when online
async function syncCartData() {
  try {
    // Get pending cart actions from IndexedDB
    const pendingActions = await getPendingCartActions();
    
    for (const action of pendingActions) {
      await fetch('/api/cart', {
        method: action.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${action.token}`
        },
        body: JSON.stringify(action.data)
      });
    }
    
    // Clear pending actions after successful sync
    await clearPendingCartActions();
    
    // Notify all clients about successful sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CART_SYNCED',
        message: 'Cart data synced successfully'
      });
    });
  } catch (error) {
    console.error('Cart sync failed:', error);
  }
}

// Sync wishlist data when online
async function syncWishlistData() {
  try {
    // Similar implementation for wishlist
    const pendingActions = await getPendingWishlistActions();
    
    for (const action of pendingActions) {
      await fetch('/api/wishlist', {
        method: action.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${action.token}`
        },
        body: JSON.stringify(action.data)
      });
    }
    
    await clearPendingWishlistActions();
    
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'WISHLIST_SYNCED',
        message: 'Wishlist data synced successfully'
      });
    });
  } catch (error) {
    console.error('Wishlist sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingCartActions() {
  // Implementation would use IndexedDB to store offline actions
  return [];
}

async function clearPendingCartActions() {
  // Clear pending cart actions from IndexedDB
}

async function getPendingWishlistActions() {
  // Implementation would use IndexedDB to store offline actions
  return [];
}

async function clearPendingWishlistActions() {
  // Clear pending wishlist actions from IndexedDB
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      image: data.image,
      data: data.data,
      actions: [
        {
          action: 'view',
          title: 'View Product',
          icon: '/icons/view-icon.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss-icon.png'
        }
      ],
      tag: data.tag,
      renotify: true,
      vibrate: [200, 100, 200]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view' && event.notification.data?.url) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url)
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Handle message from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});