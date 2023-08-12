class EventDispatcher {
  on(type, listener) {
    if(this._listeners === undefined) this._listeners = {};

    const listeners = this._listeners[type];

    if(listeners === undefined) listeners = [];

    if(listeners.indexOf(listener) === -1) {
      listeners.push(listener);
    }
  }

  has(type, listener) {
    if(this._listeners === undefined) return false;

    const listeners = this._listeners[type];

    return listeners !== undefined && listeners.indexOf(listener) !== - 1;
  }

  off(type, listener) {
    if(this._listeners === undefined) return false;

    const listeners = this._listeners[type];

    if(listeners !== undefined) {
      const index = listeners.indexOf(listener);

      if(index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  fire(event) {
    if(this._listeners === undefined) return false;

    const listeners = this._listeners[event.type];

    if(listeners !== undefined) {
      event.target = this;

      // Make a copy, in case listeners are removed while iterating.
      const array = listenerArray.slice(0);

      for(const listener of array) {
        listener.call(this, event);
      }
    }
  }
}

export { EventDispatcher };