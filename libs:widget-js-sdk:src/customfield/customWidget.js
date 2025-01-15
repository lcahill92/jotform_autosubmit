/* eslint-disable no-param-reassign */
/* eslint-disable */
/**
 * JotFormCustomWidget.js 1.5.1
 *
 *  (c) 2013 JotForm Easiest Form Builder
 */
import WebFont from 'webfontloader';
import DOMPurify from 'dompurify';


const createCustomWidget = () => {
const JFCustomWidget = (function () {
  var subscribeToken = -1;
  var subscriberIndex = {};
  var builderFrameHeight = 600;
  var builderFrameWidth = 914;
  var _readyState = false;
  var widgetSettings = false;
  var parentOrigin = false;
  var widgetData = {};
  var enterprise = false;
  var libraries = {
    callback: false,
    list: [],
    options: {
      parallel: false,
      onLoad: function () {}
    }
  };

  function getQuerystring(key, default_) {
    if (default_ === null) default_ = '';

    key = key.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
    var regex = new RegExp(`[\\?&]${key}=([^&#]*)`);
    var qs = regex.exec(window.location.href);
    if (qs === null) return default_;
    return decodeURIComponent(qs[1]);
  }

  var root = {
    texts: {},
    formID: -1,
    questionID: getQuerystring('qid')
  };

  var refQuery = getQuerystring('ref');
  var REFERER = decodeURIComponent(refQuery);

  // for oEmbed widgets referrer
  if (!refQuery || typeof refQuery === 'undefined') {
    // qid of oEmbed are attached on hash ref url
    if (typeof getQuerystring('qid') === 'undefined') {
      var hashQuery = document.location.hash.replace(/^#/, '');
      var indexSlash = hashQuery.lastIndexOf('/');

      // change ref url
      REFERER = decodeURIComponent(hashQuery.substr(0, indexSlash));

      // change qid
      root.questionID = Number(hashQuery.substr(indexSlash + 1));
    }
  }

  window.XD.receiveMessage(message => {
    // ignore this braintree message
    if ('data' in message && message.data && ((typeof message.data !== 'string') || (typeof message.data === 'string' && (message.data.indexOf('/*framebus*/') > -1 || message.data.indexOf('webpackHotUpdate') > -1)))) {
      return;
    }

    var data = JSON.parse(message.data);

    switch (data.type) {
      case 'ready':
        // if(_readyState) {
        //     console.log("should enter here 1 time actually");
        // }
        if (_readyState) {
          // console.log("should not publish ready again for", data.qid);
          return false;
        }

        // if fontfamily present, setup font
        if (data.fontFamily && data.fontFamily.length > 0) {
          setupFont(data.fontFamily);
        }

        // pass enterprise domain
        if (data.enterprise) {
          enterprise = data.enterprise;
        }

        // if settings present, setup settings
        if (data.settings && !widgetSettings) {
          widgetSettings = data.settings;
          // remove settings to be exposed on ready callback
          delete data.settings;
        }

        // set origin from parent
        if ('origin' in data) {
          parentOrigin = data.origin;
          delete data.origin;
        }


        // readystate now set
        _readyState = true;

        // register current widget data from form
        widgetData = data;

        if ((data.themeVersion === 'v2' || data.isExtendedTheme) && !isFromCardform()) {
          appendNewDefaultThemeCss();
        }

        // setup css when ready
        // custom css should override default css
        setupCSS();

        // publish
        // before publishing, load libs if set
        loadPendingLibraries(() => {
          // on card forms wait for the general css to be loaded before firing event
          if (data.cardform === true) {
            appendCardFormWidgetCss(data.formID, data.widgetID, () => {
              root.publish('ready', data);
            });
          } else {
            root.publish('ready', data);
          }
        });
        break;
      case 'settings':
        // if settings present, setup settings
        if (data.settings && !widgetSettings) {
          widgetSettings = data.settings;
        }
        break;
      case 'event:receiver':
        // console.log("event:receiver triggered", data);
        if ('isWidget' in data && data.isWidget) {
          root.publish(`event:emitter:${data.targetQID}`, data);
        } else {
          root.publish(`event:emitter:${data.eventID}`, data);
        }
        break;
      case 'formstrings':
        // set formTexts to be use by widgets
        if ('formTexts' in data && Object.keys(root.texts).length < 1) {
          root.texts = data.formTexts;
        }
        break;
      case 'widgetclear':
        root.publish('clear', data);
        break;
      case 'widgetpopulate':
        root.publish('populate', data);
        break;
      case 'widgetshift':
        root.publish('shift', data);
        break;
      case 'show':
        root.publish('show', data);
        break;
      case 'reload':
        if ('reload' in window.location) {
          window.location.reload();
        }
        break;
      case 'disable':
        root.publish('disable', data);
        break;

      case 'submit':
        var isNext = false;
        if ('method' in data && data.method === 'next') {
          isNext = true;
          root.publish('next');
        }
        root.publish('submit', isNext);
        break;
      case 'save':
        root.publish('save', data);
        break;
      case 'style':
        root.publish('style', data);
        break;
      case 'frameresize':
        root.publish('frameresize', data);
        break;
      case 'translatable':
        // set form ID
        root.formID = data.formID;
        root.publish('translatable', data);
        break;
      case 'translate':
        root.publish('translate', data);
        break;
      case 'theme':
        if ((data.themeVersion === 'v2' || data.isExtendedTheme) && !isFromCardform()) {
          appendNewDefaultThemeCss();
        }
        break;
      case 'reset':
        root.publish('reset', data);
        break;
      default:
        break;
    }
  }, REFERER);



  function publish() {
    // type of event is the first argument
    var type = arguments[0];
    // rest of arguments will be used as arguments for handler execution
    var args = [].slice.call(arguments, 1);
    if (!subscriberIndex[type]) {
      return false;
    }
    var subscribers = subscriberIndex[type];
    var len = subscribers ? subscribers.length : 0;
    while (len--) {
      subscribers[len].func(args[0]);
    }
  }

  function handleSubscribe(type, handler, options) {
    if (type === 'submit' && subscriberIndex[type] !== undefined) {
      subscriberIndex[type].pop();
    }

    if (!subscriberIndex[type]) {
      subscriberIndex[type] = [];
    }

    var token = (++subscribeToken).toString();
    if(options?.immediateCall) {
      if(_readyState) {
        return handler(widgetData);
      }
    }
    subscriberIndex[type].push({
      func: handler,
      token: token
    });

    return token;
  }

  function subscribe(type, handler, options) {
    // support for multi events
    if (~type.indexOf(' ')) {
      var events = type.split(' ');
      var tokens = [];
      for (var x = 0; x < events.length; x++) {
        var token = handleSubscribe(events[x], handler, options);
        tokens.push(token);
      }

      return tokens;
    }

    return handleSubscribe(type, handler, options);
  }

  function unsubscribe(token) {
    for (var type in subscriberIndex) {
      var subscribers = subscriberIndex[type];
      for (var i = 0; i < subscribers.length; i++) {
        var subscriber = subscribers[i];
        if (token === subscriber.token) {
          subscribers.splice(i, 1);
          return token;
        }
      }
    }
    return root;
  }

  function sendData(data) {
    // do not send data if inside builder
    if (isWidgetOnBuilder()) {
      return false;
    }

    data.type = 'data';
    data.qid = root.questionID;
    sendMessage(data);
  }

  function sendCalcValue(data) {
    // do not send data if inside builder
    if (isWidgetOnBuilder()) {
      return false;
    }

    data.type = 'calcvalue';
    data.qid = root.questionID;
    sendMessage(data);
  }

  function sendTranslatables(data) {
    // send data if inside builder
    if (isWidgetOnBuilder()) {
      var translatables = {
        type: 'translation',
        qid: root.questionID,
        formID: root.formID,
        data: data
      };
      sendMessage(translatables);
    }
  }

  function sendSubmit(data) {
    // do not send data if inside builder
    if (isWidgetOnBuilder()) {
      return false;
    }

    // console.log("submit msg arrived to widget", root.questionID);
    data.type = 'submit';
    data.qid = root.questionID;
    sendMessage(data);
  }

  function sendSave(data) {
    sendMessage(data);
  }

  function sendDisableOrEnableButtons(data) {
    // do not send data if inside builder
    if (isWidgetOnBuilder()) {
      return false;
    }
    data.qid = root.questionID;
    sendMessage(data);
  }

  function clearWidgetFields() {
    var inputs = document.querySelectorAll('input');
    var selects = document.querySelectorAll('select');

    inputs.forEach(input => {
      if (input.type === 'radio' || input.type === 'checkbox') {
        input.checked = false;
      } else if (input.type !== 'button') {
        input.value = '';
      }
    });

    selects.forEach(select => {
      select.selectedIndex = -1;
    });
  }

  function sendReady(data) {
    data.type = 'ready';
    sendMessage(data);
  }

  function requestFrameResize(data) {
    data.type = 'size';
    data.qid = root.questionID;
    sendMessage(data);
  }

  function setFrameStyles(styles) {
    sendMessage({
      type: 'styles',
      qid: root.questionID,
      styles: styles || {}
    });
  }

  function detectFrameMovement(callback) {
    var eventID = uniqid();
    sendMessage({
      eventID: eventID,
      type: 'frame:move',
      qid: root.questionID
    });
    subscribe(`event:emitter:${eventID}`, callback);
  }

  function getFrameData(callback) {
    var eventID = uniqid();
    sendMessage({
      type: 'frame:getdata',
      eventID: eventID,
      qid: root.questionID
    });
    subscribe(`event:emitter:${eventID}`, callback);
  }

  function storeToField(field, value, callback) {
    // send message through postmessage
    var hasCallback = (typeof callback !== 'undefined') ? true : false;
    var eventID = uniqid();
    sendMessage({
      eventID: eventID,
      type: 'event:store',
      field: field,
      value: value,
      qid: root.questionID,
      hasCallback: hasCallback
    });

    // subscribe if callback is present
    if (hasCallback) {
      var subToken = subscribe(`event:emitter:${eventID}`, obj => {
        callback(obj.value);

        // unsubscribe after use
        unsubscribe(subToken);
      });
    }
  }

  function setFieldsValue(fields, identifier) {
    sendMessage({
      type: 'fields:fill',
      fields: fields,
      qid: root.questionID,
      identifier: identifier || ''
    });
  }

  function clearFields(fields) {
    sendMessage({
      type: 'fields:clear',
      fields: fields,
      qid: root.questionID
    });
  }

  function getFieldsValue(fields, identifier, callback) {
    var eventID = uniqid();
    sendMessage({
      fields: fields,
      type: 'fields:capture',
      eventID: eventID,
      identifier: identifier,
      qid: root.questionID
    });

    subscribe(`event:emitter:${eventID}`, callback);
  }

  function getFieldsValueById(fields, callback) {
    getFieldsValue(fields, 'id', callback);
  }

  function getFieldsValueByName(fields, callback) {
    getFieldsValue(fields, 'name', callback);
  }

  function getFormTrackerID(callback) {
    var eventID = uniqid();
    sendMessage({
      type: 'form:trackerID',
      eventID: eventID,
      qid: root.questionID
    });

    subscribe(`event:emitter:${eventID}`, callback);
  }

  function setFieldsValueByLabel(fields) {
    setFieldsValue(fields, 'label');
  }

  function setFieldsValueById(fields) {
    setFieldsValue(fields, 'id');
  }

  function fieldListener(data, callback) {
    var eventID = uniqid();
    data.eventID = eventID;
    data.type = 'event:listener';
    data.qid = root.questionID;
    sendMessage(data);

    // subscribe if callback is present
    if (typeof callback !== 'undefined') {
      subscribe(`event:emitter:${eventID}`, callback);
      // console.log("Subscribed to event:emitter:" + eventID, data);
    }
  }

  function listenFromField(field, event, callback) {
    fieldListener({
      field: field,
      event: event
    }, result => {
      callback && callback(result.value);
    });
  }

  // TODO improve store from widget to widget
  function listenFromWidget(field, callback) {
    // subscribe if callback is present
    if (typeof callback !== 'undefined') {
      subscribe(`event:emitter:${root.questionID}`, result => {
        // console.log("Got a value from a widget", result);
        callback(result.value);
      });
      // console.log("Subscribed to event:emitter:" + root.questionID);
    }
  }

  function removeSubmittedFrame() {
    var data = {
      type: 'submit:frame:remove',
      qid: root.questionID
    };

    sendMessage(data);
  }

  function setupLibraries(libs, options) {
    // if its a function, assign the libs later
    if (typeof libs === 'function') {
      libraries.callback = libs;
    } else {
      assignPreLibraries(libs);
    }

    if (typeof options !== 'undefined') {
      libraries.options = { ...libraries.options, ...options };
    }

    return root;
  }

  function assignPreLibraries(libs) {
    if (typeof libs === 'string') {
      libs = [libs];
    }

    // make sure its array
    if (Object.prototype.toString.call(libs) !== '[object Array]') {
      libs = [];
    }

    if (libs.length > 0) {
      for (var x = 0; x < libs.length; x++) {
        libraries.list.push(libs[x]);
      }
    }
  }

  function hasLibrariesPending() {
    return libraries.list.length > 0;
  }

  function loadPendingLibraries(callback) {
    // if library callback is available set it
    if (typeof libraries.callback === 'function') {
      var libs = libraries.callback(getWidgetSettings());
      assignPreLibraries(libs);

      // set this callback to false
      libraries.callback = false;
    }

    if (hasLibrariesPending()) {
      var isParallel = ('parallel' in libraries.options && !!libraries.options.parallel);
      // make parallel request if theres moe than 1 lib
      isParallel = (isParallel && libraries.list.length > 1) ? true : false;
      if (!isParallel) {
        // console.log("Loading libraries in non parallel...");
        // process libs
        var lib = libraries.list.shift();
        // console.log("Loading lib...", lib);
        JFCustomWidgetUtils.loadJS(lib, loadedLink => {
          if (typeof libraries.options.onLoad === 'function') {
            libraries.options.onLoad(loadedLink);
          }

          // get the next lib
          loadPendingLibraries(callback);
        });
      } else {
        // load js in parallel
        // console.log("Loading libraries in parallel...");
        var loadedFiles = [];
        for (var y = 0; y < libraries.list.length; y++) {
          var lib = libraries.list[y];
          // console.log("Loading lib...", lib);
          JFCustomWidgetUtils.loadJS(lib, loadedLink => {
            if (typeof libraries.options.onLoad === 'function') {
              libraries.options.onLoad(loadedLink);
            }

            // mark file
            loadedFiles.push(loadedLink);

            // check if all files has been loaded
            if (loadedFiles.length === libraries.list.length) {
              callback && callback();
            }
          });
        }
      }
    } else {
      callback && callback();
    }
  }

  function hideWidgetContainer() {
    var data = {
      qid: root.questionID,
      type: 'field:hide'
    };
    sendMessage(data);
  }

  function makeInvisibleWidgetContainer() {
    var data = {
      qid: root.questionID,
      type: 'field:invisible'
    };
    sendMessage(data);
  }

  function resetWidgetContainer() {
    var data = {
      qid: root.questionID,
      type: 'reset'
    };
    sendMessage(data);
  }

  function showWidgetContainer() {
    var data = {
      qid: root.questionID,
      type: 'field:show'
    };
    sendMessage(data);
  }

  function replaceWidget(widget) {
    var data = {
      qid: root.questionID,
      type: 'replace',
      inputType: widget.type,
      mobile: widget.isMobile || false,
      required: ('required' in widget && widget.required)
    };
    sendMessage(data);
  }

  /**
   * Show an error to the form
   * @param  {[string]} msg [the error msg]
   */
  function showWidgetError(msg, resetForm) {
    sendMessage({
      type: 'errors',
      qid: root.questionID,
      action: 'show',
      msg: msg,
      resetForm: resetForm || false
    });

    root.sendSubmit({
      valid: false,
      value: ''
    });

    return root;
  }

  /**
   * Hide an error from the form
   */
  function hideWidgetError() {
    sendMessage({
      type: 'errors',
      qid: root.questionID,
      action: 'hide'
    });

    return root;
  }

  /**
   * Show an error to the form and enable form button back
   * @param  {[string]} msg [the error msg]
   */
  function showWidgetErrorAndResetForm(msg) {
    return showWidgetError(msg, true);
  }

  /**
   * Makes the entire question required
   */
  function makeWidgetRequired() {
    sendMessage({
      type: 'required',
      qid: root.questionID,
      action: 'set'
    });
  }

  /**
   * Makes the entire question not required
   */
  function makeWidgetNotRequired() {
    sendMessage({
      type: 'required',
      qid: root.questionID,
      action: 'unset'
    });
  }

  /**
   * Gets the current widget data - from form
   */
  function getWidgetData() {
    return widgetData;
  }

  /**
   * Check if the widget is under cardforms
   */
  function isFromCardform() {
    return (widgetData && 'cardform' in widgetData && widgetData.cardform === true);
  }

  function sendMessage(msg) {
    window.XD.postMessage(JSON.stringify(msg), REFERER, parent);
  }

  function uniqid(prefix, more_entropy) {
    if (typeof prefix === 'undefined') {
      prefix = '';
    }
    var retId;
    var formatSeed = function (seed, reqWidth) {
      seed = parseInt(seed, 10).toString(16); // to hex str
      if (reqWidth < seed.length) {
        return seed.slice(seed.length - reqWidth);
      }
      if (reqWidth > seed.length) {
        return Array(1 + (reqWidth - seed.length)).join('0') + seed;
      }
      return seed;
    };
    if (!window.php_js) {
      window.php_js = {};
    }
    if (!window.php_js.uniqidSeed) {
      window.php_js.uniqidSeed = Math.floor(Math.random() * 0x75bcd15);
    }
    window.php_js.uniqidSeed++;
    retId = prefix;
    retId += formatSeed(parseInt(new Date().getTime() / 1000, 10), 8);
    retId += formatSeed(window.php_js.uniqidSeed, 5);
    if (more_entropy) {
      retId += (Math.random() * 10).toFixed(8).toString();
    }
    return retId;
  }

  function getAllQueryString() {
    var params = {};
    var i;
    var queryString = window.location.search.substring(1);

    if (queryString) {
      // Split into key/value pairs
      var queries = queryString.split('&');

      // Convert the array of strings into an object
      for (i = 0; i < queries.length; i++) {
        var temp = queries[i].split('=');
        params[temp[0]] = decodeURIComponent(temp[1]);
      }
    }

    return params;
  }

  /**
   * Get the widget settings by using specific key
   * this came from the ready message event
   */
  function getWidgetSetting(key, default_) {
    // if widget settings not set, get the settings from URI
    // using the original method
    if (!widgetSettings) {
      return getQuerystring(key, default_);
    }
    if (default_ === null) default_ = '';
    if (key === null) {
      return default_;
    }
    var settings = getWidgetSettings();
    return DOMPurify.sanitize(settings[key]);
  }

  /**
   * Get the widget settings
   * this came from the ready message event
   */
  function getWidgetSettings() {
    // if widget settings not set, get the settings from URI
    // using the original method
    if (!widgetSettings) {
      return getAllQueryString();
    }

    // decode the original data from encoded format: encodeURIComponent(JSON.stringify(data))
    var decodesettings = JSON.parse(decodeURIComponent(widgetSettings));
    var params = {};
    for (var x = 0; x < decodesettings.length; x++) {
      var obj = decodesettings[x];
      var value = (JFCustomWidgetUtils.isJsonString(obj.value)) ? JSON.parse(obj.value) : obj.value;
      params[obj.name] = (typeof value === 'string') ? DOMPurify.sanitize(value, {ADD_ATTR: ['target']}) : value;
    }

    // merge every other params from the URL, like qid, ref and some other parameters that identify a certain widget
    var urlParams = getAllQueryString();
    for (var u in urlParams) {
      params[u] = urlParams[u];
    }

    return params;
  }

  /**
   * Get the parent frame origin
   */
  function getParentOrigin() {
    return parentOrigin || '';
  }

  function getEnterprise() {
    return enterprise;
  }
  function appendCardFormWidgetCss(formID, widgetID, loaded) {
    if (!formID || !widgetID) {
      return; // Missing parameter
    }
    try {
      var isCSSExists = !!document.getElementById('cardform_widgets_css');
      if (!isCSSExists) {
        var time = new Date().getTime();
        var baseLink = (formID === '92891840837975') ? 'https://aysenur.jotform.pro' : 'https://cdn.jotfor.ms';
        var cssUrl = `${baseLink}/stylebuilder/${formID}.widgets.${widgetID}.css?v=${time}`;
        var params = window.location.search.split('?').join('');
        var isOfflineForms = params.indexOf('offline_forms=true') > -1 || params.indexOf('offline_forms=si') > -1;
        var isLocalFile = window && window.location && window.location.href && window.location.href.indexOf('file://') === 0;
        var isOnline = window && window.navigator && window.navigator.onLine;
        if (isOfflineForms && !isOnline && isLocalFile) {
          // if local file is in offline mode dont try to load css
          setTimeout(() => {
            loaded && loaded();
          }, 0);
        } else {
          JFCustomWidgetUtils.loadCSS(cssUrl, () => {
            loaded && loaded();

            // deprecated
            root.publish('cardform:widgetcss:active');
          }, 'cardform_widgets_css');
        }
      }

      var widgetClassName = `cardFormWidget_${widgetID}`;
      var generalClassName = 'card-form-widget';

      // Class toggle for modern browsers
      if (typeof document.body.classList === 'object' && typeof document.body.classList.contains === 'function') {
        if (!document.body.classList.contains(widgetClassName)) {
          document.body.classList.add(widgetClassName);
          document.body.classList.add(generalClassName);
        }
      } else if (typeof documeny.body.className === 'string' && document.body.className.indexOf(widgetClassName) === -1) {
        document.body.className += ` ${widgetClassName}`;
        document.body.className += ` ${generalClassName}`;
      }
    } catch (ex) {
      // debug here
      console.error(ex);
    }
  }

  function appendNewDefaultThemeCss() {
    try {
      // to inject new default theme css
      var widgetListArrForTestEnv = ['image-preview'];
      var widgetListArr = ['smooth-signature', 'terms-conditions', 'take-photo', 'multiple-text-fields', 'image-slider', 'date-picker', 'checklist', 'dynamic-textbox', 'terms-scroll-widget', 'image-preview', 'configurable-list', 'asm-select'];
      var devEnvUrl = '.jotform.pro';
      var cssId = 'new_default_theme_custom_css';
      var param = 'ndt=';
      var widgetType = document.body.getAttribute('data-type');
      // for safari browser
      var additionalCheck = document.location.search.indexOf('injectCSS=true');
      // for mobile application
      var params = new URLSearchParams(window.location.search);
      var isOfflineForms = params.get('offline_forms');

      function injectAction() {
        var isCSSExists = !!document.getElementById(cssId);

        if (document.querySelector('body')) {
          document.querySelector('body').setAttribute('data-theme', 'upcoming');
        }

        if (!isCSSExists) {
          var time = new Date().getTime();
          var cssUrl = `${isOfflineForms ? '.' : `https://cdn.jotfor.ms`}/themes/CSS/defaultV2.css?v=${time}`;

          if (document.referrer.indexOf(devEnvUrl) > -1) {
            var username = document.referrer.split('.jotform.pro')[0].split('://')[1];
            cssUrl = `${isOfflineForms ? '.' : `https://${username}.jotform.pro`}/themes/CSS/defaultV2.css?v=${time}`;
          }

          JFCustomWidgetUtils.loadCSS(cssUrl, () => {
            root.publish('loadNewDefaultThemeCss');
            console.log('New Default Theme custom CSS injected');
          }, 'new_default_theme_custom_css');
        }
      }

      if (
        document.referrer.indexOf(param) > -1
        || additionalCheck > -1
        || (widgetType && (widgetListArr.indexOf(widgetType) > -1))
      ) {
        injectAction();
      }

      if (
        document.referrer.indexOf(param) > -1
        && (widgetType && (widgetListArrForTestEnv.indexOf(widgetType) > -1))
        && document.querySelector('body')
      ) {
        document.querySelector('body').setAttribute('data-env', 'test');
      }
    } catch (err) {
      console.log('NewDefaultTheme Inject Css: ERROR, ', err);
    }
  }

  // Handle widgets that are under the Section Collapse (page element)
  function handleSectionCollapse() {
    var attachDocFocusEventHandler = function () {
      document.addEventListener('focus', e => {
        var widgetSettings = JFCustomWidget.getWidgetSettings();
        parent.postMessage(JSON.stringify({
          type: 'collapse',
          qid: widgetSettings.qid
        }), '*');
      }, true);
    };
    if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
      attachDocFocusEventHandler();
    } else {
      document.addEventListener('DOMContentLoaded', attachDocFocusEventHandler);
    }
  }

  function init() {
    // subscribe to ready event by default
    root.subscribe('ready', data => {
      // make body background transparent
      document.body.style.background = 'transparent';

      // if("background" in data){
      //     document.body.style.background = data.background;
      //     if(data.background.indexOf('url') >= 0) {
      //         document.body.style.background = 'transparent';
      //     }
      // }
      // root.questionID = data.qid;
      // console.log("widget is ready now", data, root.questionID);
    });

    root.subscribe('submit', () => {
      root.sendSubmit({
        initial: true,
        data: false,
        valid: true
      });
    });

    root.subscribe('save', () => {
      root.sendSave({});
    });

    root.subscribe('style', data => {
      // console.log("style message arrived to widget", data);
      // if(data.background !== undefined) {
      //     document.body.style.background = data.background;
      //     if(data.background.indexOf('url') >= 0) {
      //         document.body.style.background = 'transparent';
      //     }
      // }

      if (data.font !== undefined) {
        var ff = data.font.family;
        setupFont(ff);
      }
    });

    root.subscribe('clear', root.clearWidgetFields);

    handleSectionCollapse();
  }

  /**
   * Setup css for widget right away
   * this is for soon to be custom css under advance settings
   */
  function setupCSS() {
    var customcss = decode_entities(getWidgetSetting('customCSS'));
    if (customcss && customcss.length > 0 && customcss !== '<empty>') {
      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');

      style.type = 'text/css';
      if (style.styleSheet) {
        style.styleSheet.cssText = customcss;
      } else {
        style.appendChild(document.createTextNode(customcss));
      }

      head.appendChild(style);
    }
  }

  function setupFont(fontFamily) {
    fontFamily = fontFamily.replace(/\'|\"|(\,\s*sans-serif)/ig, '');
    var systemFonts = ['Arial', 'Arial Black', 'Courier', 'Courier New', 'Comic Sans MS', 'Gill Sans',
      'Helvetica', 'Lucida', 'Lucida Grande', 'Trebuchet MS', 'Tahoma', 'Times New Roman', 'Verdana',
      'Calibri'
    ];

    // console.log("update font", fontFamily);
    // get first font from fontFamily string
    // eslint-disable-next-line prefer-destructuring
    fontFamily = fontFamily.split(',')[0];

    if (systemFonts.indexOf(fontFamily) >= 0) {
      // document.body.style.setProperty("fontFamily", '"'+fontFamily+'", sans-serif', "important");
      document.body.style.fontFamily = `"${fontFamily}", sans-serif`;
      // publish event when font active
      root.publish('customfont:active', fontFamily); // deprecated
      root.publish('customfont', fontFamily);
    } else {
      // document.body.style.setProperty("fontFamily", '"'+fontFamily+'", sans-serif', "important");
      document.body.style.fontFamily = `"${fontFamily}", sans-serif`;
      var fontfaceUrl = `https://cdn.jotfor.ms/fonts/?family=${fontFamily}`;
      // load google fonts
      WebFont.load({
        custom: {
          urls: [fontfaceUrl],
          families: [fontFamily]
        },
        active: function () {
          // publish event when font active
          root.publish('customfont:active', fontFamily); // deprecated
          root.publish('customfont', fontFamily);
        }
      });
    }
  }


  /**
   * Generic way to decode common html entities
   * that doesn't need any dependencies
   */
  function decode_entities(str) {
    // Remove HTML Entities
    var element = document.createElement('div');

    if (str && typeof str === 'string') {
      // Escape HTML before decoding for HTML Entities
      str = escape(str).replace(/%26/g, '&')
        .replace(/%23/g, '#').replace(/%3B/g, ';');

      element.innerHTML = str;
      if (element.innerText) {
        str = element.innerText;
        element.innerText = '';
      } else {
        // Firefox support
        str = element.textContent;
        element.textContent = '';
      }
    }

    return unescape(str);
  }

  /**
   * Check if the widget is required
   */
  function isWidgetRequired() {
    var isrequired = false;
    if ('required' in widgetData) {
      isrequired = widgetData.required;
    }

    return isrequired;
  }

  /**
   * Check if the widget is static
   */
  function isWidgetStatic() {
    return ('static' in widgetData) ? widgetData.static : false;
  }

  /**
   * Check if the widget loads from builder
   */
  function isWidgetOnBuilder() {
    var isonwizard = false;
    if ('onWizard' in widgetData) {
      isonwizard = widgetData.onWizard;
    }

    return isonwizard;
  }

  function isWidgetReady() {
    return _readyState;
  }

  // root.sendMessage = sendMessage;
  root.publish = publish;
  root.subscribe = subscribe;
  root.on = subscribe;
  root.unsubscribe = unsubscribe;
  root.off = unsubscribe;
  root.sendData = sendData;
  root.sendCalcValue = sendCalcValue;
  root.sendTranslatables = sendTranslatables;
  root.sendSubmit = sendSubmit;
  root.sendDisableOrEnableButtons = sendDisableOrEnableButtons;
  root.sendSave = sendSave;
  root.clearWidgetFields = clearWidgetFields;
  root.sendReady = sendReady;
  root.requestFrameResize = requestFrameResize;
  root.setFrameSize = requestFrameResize;
  root.setFrameStyles = setFrameStyles;
  root.detectFrameMovement = detectFrameMovement;
  root.hideWidgetContainer = hideWidgetContainer;
  root.makeInvisibleWidgetContainer = makeInvisibleWidgetContainer;
  root.resetWidgetContainer = resetWidgetContainer;
  root.showWidgetContainer = showWidgetContainer;
  root.replaceWidget = replaceWidget;
  root.getWidgetData = getWidgetData;
  root.getFrameData = getFrameData;
  root.isFromCardform = isFromCardform;
  root.setupLibraries = setupLibraries;
  root.removeSubmittedFrame = removeSubmittedFrame;

  root.showWidgetError = showWidgetError;
  root.hideWidgetError = hideWidgetError;
  root.makeWidgetRequired = makeWidgetRequired;
  root.makeWidgetNotRequired = makeWidgetNotRequired;

  root.listenFromField = listenFromField;
  root.listenFromWidget = listenFromWidget;
  root.storeToField = storeToField;
  root.setFieldsValueByLabel = setFieldsValueByLabel;
  root.setFieldsValueById = setFieldsValueById;
  root.clearFields = clearFields;
  root.getFieldsValueById = getFieldsValueById;
  root.getFieldsValueByName = getFieldsValueByName;

  root.getFormTrackerID = getFormTrackerID;

  root.getQueryString = getWidgetSetting; // deprecated, just to support old widgets
  root.getAllQueryString = getWidgetSettings; // deprecated, just to support old widgets
  root.getWidgetSetting = getWidgetSetting;
  root.getWidgetSettings = getWidgetSettings;
  root.getParentOrigin = getParentOrigin;
  root.getEnterprise = getEnterprise;

  // helper functions
  root.isWidgetRequired = isWidgetRequired;
  root.isWidgetStatic = isWidgetStatic;
  root.isWidgetOnBuilder = isWidgetOnBuilder;
  root.isWidgetReady = isWidgetReady;
  // initialize client
  init();

  // expose functions
  return root;
}());
return JFCustomWidget;
}

export default createCustomWidget;
