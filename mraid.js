(function () {
  var mraid = (window.mraid = {});

  // add important constants
  const states = (mraid.states = {
    LOADING: "loading",
    DEFAULT: "default",
    EXPANDED: "expanded",
    RESIZED: "resized",
    HIDDEN: "hidden",
  });
  const events = (mraid.EVENTS = {
    ERROR: "error",
    READY: "ready",
    STATECHANGE: "stateChange",
    VIEWABLECHANGE: "viewableChange",
  });
  let state = states.LOADING;
  let isViewable = true;
  const eventListeners = {};

  // **************************event handling START **************************
  /**
   * Event Handling helper class.
   */
  class EventListeners {
    constructor(event) {
      this.event = event;
      this.count = 0;
      this.listeners = {};
    }

    add(action) {
      const id = String(action);
      if (!this.listeners[id]) {
        this.listeners[id] = action;
        this.count++;
      }
    }

    remove(action) {
      let isSuccess = false;
      const id = String(action);
      if (this.listeners[action]) {
        this.listeners[action] = null;
        delete this.listeners[action];
        this.count--;
        isSuccess = true;
      }
      return isSuccess;
    }

    removeAll() {
      for (const id in this.listeners) {
        if (listeners.hasOwnProperty(id)) {
          this.remove(listeners[id]);
        }
      }
    }

    broadcast(args) {
      for (const id in this.listeners) {
        if (this.listeners.hasOwnProperty(id)) {
          this.listeners[id].apply(mraid, args);
        }
      }
    }
  }

  const broadcastEvent = (...args) => {
    for (var i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    const event = args.shift();
    if (eventListeners[event]) {
      eventListeners[event].broadcast(args);
    }
  };

  mraid.addEventListener = (eventName, listener) => {
    if (!eventName || !listener) {
      broadcastEvent(
        events.ERROR,
        "You must supply an eventName and an action.",
        "AddEventListener"
      );
      return;
    } else if (!eventListeners[eventName]) {
      eventListeners[eventName] = new EventListeners(eventName);
    }
    eventListeners[eventName].add(listener);
  };

  mraid.removeEventListener = (eventName, listener) => {
    if (eventListeners[eventName]) {
      if (!listener) {
        eventListeners[eventName].removeAll();
      } else if (!eventListeners[eventName].remove(listener)) {
        broadcastEvent(
          events.ERROR,
          "Listener not currently registered for event.",
          "removeEventListener"
        );
      }
    }

    if (eventListeners[eventName] && eventListeners[eventName].count === 0) {
      eventListeners[eventName] = null;
      delete eventListeners[eventName];
    }
  };

  // **************************event handling END **************************

  mraid.open = (url) => {
    if (!url) {
      broadcastEvent(events.ERROR, "Invalid URL: " + url, "open");
      return;
    }
    window.open(url);
  };

  mraid.close = () => {
    if (state === states.HIDDEN) {
      broadcastEvent(
        events.ERROR,
        "Ad cannot be closed when it is already hidden.",
        "close"
      );
      return;
    }
  };

  mraid.getState = () => state;

  mraid.isViewable = () => isViewable;

  mraid.playVideo = (uri) => {
    if (!uri) {
      broadcastEvent(events.ERROR, "Invalid URI: " + uri, "playVideo");
      return;
    }

    const videoSourceElem = document.getElementById("ad-video-source");
    videoSourceElem.setAttribute("src", uri);
    const video = document.getElementById("ad-video");
    video.load();
  };

  mraid.fireReadyEvent = () => broadcastEvent(events.READY);

  mraid.fireErrorEvent = (message, action) => broadcastEvent(events.ERROR, message, action);

  mraid.fireStateChangeEvent = (newState) => {
    if (state !== newState) {
        state = newState;
        broadcastEvent(events.STATECHANGE, state);
    }
};

})();