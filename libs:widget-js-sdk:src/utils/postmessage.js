/* eslint-disable camelcase */
const injectPostMessage = () => {
  if (window.getIframeWindow === undefined) {
    window.getIframeWindow = function getIframeWindow(iframeObject) {
      let doc;
      if (iframeObject.contentWindow) {
        return iframeObject.contentWindow;
      }
      if (iframeObject.window) {
        return iframeObject.window;
      }
      if (!doc && iframeObject.contentDocument) {
        doc = iframeObject.contentDocument;
      }
      if (!doc && iframeObject.document) {
        doc = iframeObject.document;
      }
      if (doc && doc.defaultView) {
        return doc.defaultView;
      }
      if (doc && doc.parentWindow) {
        return doc.parentWindow;
      }
    };
  }

  // postMessage utility function
  if (typeof window.XD === 'undefined') {
    window.XD = (() => {
      let interval_id;
      let last_hash;
      let cache_bust = 1;
      let attached_callback;
      return {
        postMessage: (message, target_url, _target) => {
          if (!target_url) {
            return;
          }

          let target = _target || window.parent; // default to parent
          if (window.postMessage) {
            let postMessageTarget = target_url.replace(/([^:]+:\/\/[^/]+).*/, '$1');
            // the browser supports window.postMessage, so call it with a targetOrigin
            // set appropriately, based on the target_url parameter.
            if (!('postMessage' in target)) {
            // we have a problem, update target
              target = window.getIframeWindow(target);
            }
            if (!target) {
              return;
            }
            if (postMessageTarget.indexOf('file://') === 0) { // This means we are using file locally. (like offline forms)
              postMessageTarget = '*';
            }
            target.postMessage(message, postMessageTarget);
          } else if (target_url) {
          // the browser does not support window.postMessage, so use the window.location.hash fragment hack
            target.location = `${target_url.replace(/#.*$/, '')}#${+new Date()}${cache_bust++}&${message}`;
          }
        },
        receiveMessage: (callback, source_origin) => {
        // browser supports window.postMessage
          if (window.postMessage) {
          // bind the callback to the actual event associated with window.postMessage

            if (callback) {
              attached_callback = e => {
                const params = window.location.search.split('?').join('');
                const isOfflineForms = params.indexOf('offline_forms=true') > -1 || params.indexOf('offline_forms=si') > -1;

                // eslint-disable-next-line max-len
                if (!isOfflineForms && ((typeof source_origin === 'string' && e.origin !== source_origin) || (Object.prototype.toString.call(source_origin) === '[object Function]' && source_origin(e.origin) === !1))) {
                  return !1;
                }
                callback(e);
              };
            }
            if (window.addEventListener) {
              window[callback ? 'addEventListener' : 'removeEventListener']('message', attached_callback, !1);
            } else {
              window[callback ? 'attachEvent' : 'detachEvent']('onmessage', attached_callback);
            }
          } else {
          // a polling loop is started & callback is called whenever the location.hash changes
            if (interval_id) {
              clearInterval(interval_id);
            }
            interval_id = null;
            if (callback) {
              interval_id = setInterval(() => {
                const { hash } = document.location;
                const re = /^#?\d+&/;
                if (hash !== last_hash && re.test(hash)) {
                  last_hash = hash;
                  callback({
                    data: hash.replace(re, '')
                  });
                }
              }, 100);
            }
          }
        }
      };
    })();
  }
};
export default injectPostMessage;
