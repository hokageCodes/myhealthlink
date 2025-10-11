const CACHE_NAME = 'myhealthlink-v1';
const STATIC_CACHE_NAME = 'myhealthlink-static-v1';
const DYNAMIC_CACHE_NAME = 'myhealthlink-dynamic-v1';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/dashboard/documents',
  '/dashboard/health',
  '/dashboard/profile',
  '/dashboard/share',
  '/login',
  '/register',
  '/manifest.json',
  // Add your static assets here
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/localhost:5000\/api\/auth/,
  /^https:\/\/localhost:5000\/api\/documents/,
  /^https:\/\/localhost:5000\/api\/health/,
  /^https:\/\/localhost:5000\/api\/public/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/') || API_CACHE_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets and pages
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed for API request, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for critical endpoints
    if (request.url.includes('/api/auth/profile')) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Offline mode - profile data unavailable',
          offline: true
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Both cache and network failed for:', request.url);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'health-data-sync') {
    event.waitUntil(syncHealthData());
  } else if (event.tag === 'document-sync') {
    event.waitUntil(syncDocuments());
  }
});

// Sync health data when back online
async function syncHealthData() {
  try {
    // Get pending health data from IndexedDB
    const pendingData = await getPendingHealthData();
    
    for (const data of pendingData) {
      try {
        const response = await fetch('/api/health/metrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
          },
          body: JSON.stringify(data.metric)
        });
        
        if (response.ok) {
          await removePendingHealthData(data.id);
        }
      } catch (error) {
        console.error('Failed to sync health data:', error);
      }
    }
  } catch (error) {
    console.error('Health data sync failed:', error);
  }
}

// Sync documents when back online
async function syncDocuments() {
  try {
    const pendingDocs = await getPendingDocuments();
    
    for (const doc of pendingDocs) {
      try {
        const formData = new FormData();
        formData.append('file', doc.file);
        formData.append('category', doc.category);
        
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${doc.token}`
          },
          body: formData
        });
        
        if (response.ok) {
          await removePendingDocument(doc.id);
        }
      } catch (error) {
        console.error('Failed to sync document:', error);
      }
    }
  } catch (error) {
    console.error('Document sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New health update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/open-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('MyHealthLink', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Helper functions for IndexedDB operations
async function getPendingHealthData() {
  // Implementation would use IndexedDB
  return [];
}

async function removePendingHealthData(id) {
  // Implementation would use IndexedDB
  console.log('Removed pending health data:', id);
}

async function getPendingDocuments() {
  // Implementation would use IndexedDB
  return [];
}

async function removePendingDocument(id) {
  // Implementation would use IndexedDB
  console.log('Removed pending document:', id);
}
