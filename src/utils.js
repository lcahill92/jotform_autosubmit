// File: utils.js
const createWidgetUtils = () => {
  const JFCustomWidgetUtils = (() => {
    const utils = {};

    // Function to check if a string is valid JSON
    utils.isJsonString = (str) => {
      try {
        const parsed = JSON.parse(str);
        return parsed && typeof parsed === 'object';
      } catch (e) {
        return false;
      }
    };

    // Load an external JavaScript file dynamically
    utils.loadJS = (scriptUrl, callback) => {
      const scriptElement = document.createElement('script');
      scriptElement.type = 'text/javascript';
      scriptElement.async = false;
      scriptElement.src = scriptUrl;

      scriptElement.onload = () => {
        if (callback) callback(scriptUrl);
      };

      document.head.appendChild(scriptElement);
    };

    return utils;
  })();

  return JFCustomWidgetUtils;
};

export default createWidgetUtils;
