// File: postmessage.js
const injectPostMessage = () => {
  if (typeof window.XD === 'undefined') {
    window.XD = (() => {
      return {
        postMessage: (message, target_url, target = window.parent) => {
          if (window.postMessage) {
            const postMessageTarget = target_url.replace(/([^:]+:\/\/[^/]+).*/, '$1') || '*';
            target.postMessage(message, postMessageTarget);
          }
        },
        receiveMessage: (callback) => {
          if (window.postMessage) {
            if (callback) {
              const attached_callback = (e) => {
                callback(e);
              };
              window.addEventListener('message', attached_callback, false);
            }
          }
        },
      };
    })();
  }
};

export default injectPostMessage;
