// Event-based synchronization for cart and wishlist counts across navbar and pages

class StoreEventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });
  }
}

export const storeEvents = new StoreEventEmitter();

export const CART_UPDATED = "CART_UPDATED";
export const WISHLIST_UPDATED = "WISHLIST_UPDATED";
export const TOAST_NOTIFICATION = "TOAST_NOTIFICATION";

export function notifyToast(message, type = "info", duration = 3000) {
  storeEvents.emit(TOAST_NOTIFICATION, { message, type, duration, id: Date.now() + Math.random() });
}

export function notifyCartUpdated(count) {
  storeEvents.emit(CART_UPDATED, count);
}

export function notifyWishlistUpdated(count) {
  storeEvents.emit(WISHLIST_UPDATED, count);
}
