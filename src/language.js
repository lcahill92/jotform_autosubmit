// File: language.js
const createWidgetTranslations = () => {
  const JFWidgetTranslation = (() => {
    const lang = {};
    const dictionary = {};

    lang.setDictionary = (data) => {
      Object.assign(dictionary, data);
    };

    lang.translate = (key) => dictionary[key] || key;

    return lang;
  })();

  return JFWidgetTranslation;
};

export default createWidgetTranslations;
