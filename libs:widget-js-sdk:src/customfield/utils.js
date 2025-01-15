/* eslint-disable */

const createWidgetUtils = () => {
const JFCustomWidgetUtils = (function () {
  var utils = {};
  var metadataKey = 'widget_metadata';
  var requestAnimationFrameId;

  /**
   * Get s3 upload url relative path
   */
  function getS3UriRelativePath(url) {
    if (typeof url !== 'undefined' && !!~url.indexOf('/jotformWidgets/')) {
      var splits = url.split('/jotformWidgets/');
      url = `/widget-uploads/${splits[1]}`;
    }

    return url;
  }

  /**
   * Reset jotform upload url
   * https://www.jotform.com/widget-uploads/widget/xxx
   * and convert it to just /widget-uploads/widget/xxx
   */
  function resetS3UriOrigin(url) {
    var uploadPath = '/uploads/';
    if (url.indexOf(uploadPath) === -1)  {
      uploadPath = '/widget-uploads/';
    }

    var pos = url.indexOf(uploadPath);
    if (typeof url !== 'undefined' && (!!~pos && pos > 0)) {
      var splits = url.split(uploadPath);
      url = `${uploadPath}${splits[1]}`;
    }

    return url;
  }

  /**
   * Fixed s3 upload relative path
   * this is to use the right origin
   * for images that points to jotform
   */
  function fixS3UriOrigin(url) {
    var uploadPath = '/uploads/';
    if (url.indexOf(uploadPath) === -1)  {
      uploadPath = '/widget-uploads/';
    }

    var pos = url.indexOf(uploadPath);
    if (typeof url !== 'undefined' && (!!~pos && pos === 0)) {
      url = getS3UriRelativePath(url);
      url = JFCustomWidget.getParentOrigin() + url;
    }

    return url;
  }

  /**
   * Get the form's domain
   * @returns {string}
   */

  function getFormDomain() {
    if (window.location.search.match(/ref=([^&]+)/)) {
      return `${decodeURIComponent(window.location.search.match(/ref=([^&]+)/)[1])}/`;
    }
    return 'https://www.jotform.com/';
  }

  /**
   * Get the IE version otherwise 'undefined'
   */
  function getIEVersion() {
    var match = navigator.userAgent.match(/(?:MSIE |Trident\/.*; rv:)(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  }

  /**
   * Check if safari browsers
   * On desktop Chrome has both 'Chrome' and 'Safari' inside userAgent string.
   * Safari has only 'Safari'.
   * On iOS Chrome has 'CriOS' and Firefox has 'FxiOS' inside userAgent string.
   */
  function isSafari() {
    var chrome = navigator.userAgent.toLowerCase().match(/chrome|crios/);
    var firefox = navigator.userAgent.toLowerCase().match(/firefox|fxios/);
    var safari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

    if (safari && !chrome && !firefox) {
      return true;
    }

    return false;
  }

  /**
   * Check if firefox browsers
   */
  function isFirefox() {
    return navigator.userAgent.toLowerCase().match(/firefox|fxios/);
  }

  /**
   * Detect if mobile platform
   */
  function isMobile() {
    var ua = navigator.userAgent.toLowerCase();

    return (/iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua))
      || (/ipad|android 3|sch-i800|playbook|tablet|kindle|gt-p1000|sgh-t849|shw-m180s|a510|a511|a100|dell streak|silk/i.test(ua))
      || (ua.indexOf('macintosh') > -1 && navigator.maxTouchPoints > 1);
  }

  /**
   * function that will check if a string
   * is a valid JSON string
   * @param {string} str string to be check
   */
  function isJsonString(str) {
    try {
      var o = JSON.parse(str);
      // Handle non-exception-throwing cases:
      // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
      // but... JSON.parse(null) returns 'null', and typeof null === "object",
      // so we must check for that, too.
      if (o && typeof o === 'object' && o !== null) {
        return true;
      }
    } catch (e) {}

    return false;
  }

  /**
   * Identify the type of a data
   */
  function identifyType(data) {
    var str = Object.prototype.toString.call(data);
    return str.replace(/^\[object (\w+)\]$/, '$1');
  }

  /**
   * Identifies object data
   * @return {[boolean]}
   */
  function isObject(data) {
    return identifyType(data) === 'Object';
  }

  /**
   * Identifies array data
   * @return {[boolean]}
   */
  function isArray(data) {
    return identifyType(data) === 'Array';
  }

  /**
   * Build a metadata for widget before sending to form
   * this is optional if the value being pass contains link, images, tables we want to display
   * if we want to format it on the backend we need to pass a special
   * json string for the widgetparser.php can work into. This can make
   * a html equivalent string on backend that works with both emails and reports
   * @param  {[string]} type  [type of the data we want to display can be either links,imagelinks,table]
   * @param  {[array|string]} value [and array or string of all the values to be passed]
   * @return {[string]}       [the json string of the metadata that was built]
   */
  function buildMetadata(type, value) {
    // if nothing set return boolean false
    if (
      (typeof type === 'undefined' || typeof value === 'undefined')
      || (type === false || value === false)
    ) {
      return '';
    }

    var dataJson = {};
    dataJson[metadataKey] = {
      type: type,
      value: value
    };

    return JSON.stringify(dataJson);
  }

  /**
   * Extract the data from the metadata JSON object that comes from the widget
   * e.g of widget that use metadata(drag&drop, imagepicker, imageuploadpreview)
   * @param  {string}   the json string with metadata key
   * @return {array}    the extracted data of the widget, otherwise an empty array
   */
  function extractMetadata(widgetVal) {
    var value = [];

    if (!isJsonString(widgetVal)) {
      return value;
    }

    var metaData = JSON.parse(widgetVal);
    // check if meta data key is present
    if (metaData.hasOwnProperty(metadataKey)) {
      value = metaData[metadataKey].value;
    }

    return value;
  }

  /**
   * Verify if the widget value contains meta data
   * @param  {string}   a string to check
   * @return {boolean}
   */
  function hasMetadata(widgetVal) {
    if (!isJsonString(widgetVal)) {
      return false;
    }

    var metaData = JSON.parse(widgetVal);
    // check if meta data key is present
    if (metaData.hasOwnProperty(metadataKey)) {
      return true;
    }

    return false;
  }

  /**
   * Checked whether a widget parameter is empty
   * @param  {string}  a string to check
   * @return {Boolean}
   */
  function isEmpty(widgetParam) {
    return (typeof widgetParam === 'undefined' || widgetParam === '' || widgetParam === '<empty>');
  }

  /**
   * A hacky way to decode html entities on a string
   */
  function decodeHtmlEntities(str) {
    var txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  }

  /**
   * A hacky way to encode html entities on a string
   */
  function encodeHtmlEntities(str) {
    var txt = document.createElement('textarea');
    txt.textContent = str;
    return txt.innerHTML;
  }

  /**
   * Run until a certain x seconds
   */
  function executeUntil(secondsValue, callback) {
    var seconds = 5000;
    if (typeof secondsValue === 'function') {
      seconds = false;
      callback = secondsValue;
    } else if (typeof secondsValue === 'number') {
      seconds = secondsValue;
    }

    // if this is called again with existing requestAnimationFrameId
    // clear the current animation frame
    if (requestAnimationFrameId) {
      window.cancelAnimationFrame(requestAnimationFrameId);
    }

    // start tick
    var tick = function () {
      callback && callback();
      requestAnimationFrameId = window.requestAnimationFrame(tick);
    };

    tick();

    // timeout to cancel animation frame
    if (seconds) {
      setTimeout(() => {
        if (requestAnimationFrameId) {
          window.cancelAnimationFrame(requestAnimationFrameId);
        }
      }, seconds);
    }
  }

  /**
   * executeUntil alias
   */
  function animateUntil() {
    executeUntil.apply(null, arguments);
  }

  /**
   * vanilla js for dm ready event like jquery
   */
  function domReady(fn) {
    if (document.readyState != 'loading') {
      fn();
    } else if (document.addEventListener) {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      document.attachEvent('onreadystatechange', () => {
        if (document.readyState != 'loading') { fn(); }
      });
    }
  }

  /**
   * Load JS file with callback
   */
  function loadJS(scriptUrl, afterCallback) {
    var scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.async = false;
    scriptElement.src = scriptUrl;

    var ieLoadBugFix = function (scriptElement, callback) {
      if (scriptElement.readyState == 'loaded' || scriptElement.readyState == 'complete') {
        callback();
      } else {
        setTimeout(() => {
          ieLoadBugFix(scriptElement, callback);
        }, 100);
      }
    };

    if (typeof afterCallback === 'function') {
      if (typeof scriptElement.addEventListener !== 'undefined') {
        scriptElement.addEventListener('load', () => {
          afterCallback(scriptUrl);
        }, false);
      } else {
        scriptElement.onreadystatechange = function () {
          scriptElement.onreadystatechange = null;
          ieLoadBugFix(scriptElement, () => {
            afterCallback(scriptUrl);
          });
        };
      }
    }

    (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(scriptElement);
  }

  /**
   * Load CSS file with callback
   */
  function loadCSS(url, onLoad, id) {
    var styleElement = document.createElement('link');
    styleElement.setAttribute('type', 'text/css');
    styleElement.setAttribute('rel', 'stylesheet');
    styleElement.setAttribute('media', 'all');
    styleElement.setAttribute('href', url);

    if (typeof id !== 'undefined') {
      styleElement.setAttribute('id', id);
    }

    if (styleElement.readyState) { // IE
      styleElement.onreadystatechange = function () {
        if (styleElement.readyState == 'loaded' || styleElement.readyState == 'complete') {
          styleElement.onreadystatechange = null;
          onLoad && onLoad();
        }
      };
    } else { // Others
      if (isSafari() || isFirefox()) {
        // reset and create alternative
        styleElement = document.createElement('style');
        styleElement.textContent = `@import "${url}"`;

        var fi = setInterval(() => {
          try {
            styleElement.sheet.cssRules; // <--- MAGIC: only populated when file is loaded
            onLoad && onLoad();
            clearInterval(fi);
          } catch (e) {}
        }, 10);
      } else if (styleElement.addEventListener) {
        styleElement.addEventListener('load', onLoad);
      } else if (styleElement.attachEvent) {
        styleElement.attachEvent('onload', onLoad);
      }

      // This code is for browsers that don’t support onload
      // No support for onload (it'll bind but never fire):
      //  * Android 4.3 (Samsung Galaxy S4, Browserstack)
      //  * Android 4.2 Browser (Samsung Galaxy SIII Mini GT-I8200L)
      //  * Android 2.3 (Pantech Burst P9070)

      // Weak inference targets Android < 4.4
      else if ('isApplicationInstalled' in navigator && 'onloadcssdefined' in styleElement) {
        styleElement.onloadcssdefined(onLoad);
      }
    }

    (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(styleElement);
  }

  utils.domReady = domReady;
  utils.loadJS = loadJS;
  utils.loadCSS = loadCSS;
  utils.isJsonString = isJsonString;
  utils.getIE = getIEVersion;
  utils.isSafari = isSafari;
  utils.isFirefox = isFirefox;
  utils.isMobile = isMobile;
  utils.buildMetadata = buildMetadata;
  utils.extractMetadata = extractMetadata;
  utils.hasMetadata = hasMetadata;
  utils.decodeHtmlEntities = decodeHtmlEntities;
  utils.encodeHtmlEntities = encodeHtmlEntities;
  utils.getS3UriRelativePath = getS3UriRelativePath;
  utils.fixS3UriOrigin = fixS3UriOrigin;
  utils.resetS3UriOrigin = resetS3UriOrigin;
  utils.executeUntil = executeUntil;
  utils.animateUntil = animateUntil;
  utils.isEmpty = isEmpty;
  utils.isObject = isObject;
  utils.isArray = isArray;
  utils.getFormDomain = getFormDomain;

  return utils;
}());
return JFCustomWidgetUtils;
}

export default createWidgetUtils;
