// Push Notification Utilities

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Request push notification permission
 */
export const requestPermission = async () => {
  if (!('Notification' in window)) {
    return {
      success: false,
      message: 'This browser does not support notifications'
    };
  }

  if (Notification.permission === 'granted') {
    return {
      success: true,
      message: 'Notifications already enabled'
    };
  }

  if (Notification.permission === 'denied') {
    return {
      success: false,
      message: 'Notifications are blocked. Please enable them in your browser settings'
    };
  }

  try {
    const permission = await Notification.requestPermission();
    return {
      success: permission === 'granted',
      message: permission === 'granted' 
        ? 'Notifications enabled' 
        : 'Notification permission denied'
    };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return {
      success: false,
      message: 'Error requesting notification permission'
    };
  }
};

/**
 * Register service worker for push notifications
 */
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return {
      success: false,
      message: 'Service workers are not supported'
    };
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('Service Worker registered:', registration);
    return {
      success: true,
      registration,
      message: 'Service worker registered successfully'
    };
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return {
      success: false,
      message: 'Service worker registration failed'
    };
  }
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPush = async (vapidPublicKey) => {
  try {
    // Register service worker
    const swResult = await registerServiceWorker();
    if (!swResult.success || !swResult.registration) {
      return {
        success: false,
        message: swResult.message || 'Failed to register service worker'
      };
    }

    const registration = swResult.registration;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
    }

    // Convert subscription to JSON
    const subscriptionJSON = subscription.toJSON();
    const keys = subscription.getKey ? {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth'))
    } : {};

    return {
      success: true,
      subscription: {
        endpoint: subscriptionJSON.endpoint,
        keys
      },
      message: 'Subscribed to push notifications'
    };
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return {
      success: false,
      message: error.message || 'Failed to subscribe to push notifications'
    };
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return {
        success: true,
        message: 'Unsubscribed from push notifications'
      };
    }

    return {
      success: true,
      message: 'No active subscription found'
    };
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return {
      success: false,
      message: error.message || 'Failed to unsubscribe'
    };
  }
};

/**
 * Get current push subscription
 */
export const getPushSubscription = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return {
        success: false,
        subscription: null,
        message: 'No active subscription'
      };
    }

    const subscriptionJSON = subscription.toJSON();
    const keys = subscription.getKey ? {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth'))
    } : {};

    return {
      success: true,
      subscription: {
        endpoint: subscriptionJSON.endpoint,
        keys
      }
    };
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return {
      success: false,
      subscription: null,
      message: error.message || 'Failed to get subscription'
    };
  }
};

/**
 * Helper function to convert ArrayBuffer to Base64
 */
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

