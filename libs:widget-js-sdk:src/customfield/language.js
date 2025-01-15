/* eslint-disable */
/**
 * JotForm Widget Language Translation
 *
 * Documentation: https://github.com/jotform/app-widgets/blob/master/docs/widget/widget-language-support-guide.md
 */

const createWidgetTranslations = () => {
const JFWidgetTranslation = (function () {
  var lang = {};
  var translationStore = {};
  var dictionaryData = {};
  var translatables = {};
  var elementTextLookup = {
    input: [
      'placeholder',
      'innerText'
    ],
    button: [
      'innerText',
      'title'
    ],
    textarea: [
      'placeholder',
      'innerText'
    ],
    option: [
      'innerText'
    ],
    img: [
      'title'
    ]
  };

  /**
   * Get translatable text via 'translatable' class name (Public)
   *
   * @param {Function} callback - Callback function
   */
  function getTranslatables(callback) {
    var translatables = [];

    document.querySelectorAll('.translatable').forEach(element => {
      var entry = {};
      var elemTranslatableText = getElementText(element);
      elemTranslatableText.forEach(item => {
        if (!(translatables.indexOf(item) > -1)) {
          translatables.push(item);
        }
      });
    });

    if (callback) {
      return callback(translatables);
    }
    return translatables;
  }

  /**
   * Get element's translatable text e.g. innetText, title, value, etc (Private)
   *
   * @param {Node} element - Element
   */
  function getElementText(element) {
    var textData = [];
    var elemType = element.tagName.toLowerCase();
    var elemTranslatableProps = elementTextLookup[elemType];

    if (elemTranslatableProps !== undefined) {
      elemTranslatableProps.forEach(item => {
        var text = '';
        switch(item) {
          case 'innerText':
            text = element.innerText;
            break;
          case 'placeholder':
            text = element.placeholder;
            break;
          case 'title':
            text = element.title;
        }
        if (isNaN(text)) {
          if (text.length !== 0 && text !== '') {
            textData.push(text);
          }
        }
      });
    } else { // Use default 'innerText' property to get element's text
      if (isNaN(element.innerText)) {
        if (element.innerText.length !== 0 && element.innerText !== '') {
          textData.push(element.innerText);
        }
      }
    }

    return textData;
  }

  /**
   * Set (translation) dictionary (Public)
   *
   * @param {Object} data - Dictionary data
   */
  function setDictionary(data) {
    dictionaryData = data;
  }

  /**
   * Set (translation) dictionary (Public)
   */
  function getDictionary() {
    return dictionaryData;
  }

  /**
   * Translate, replace element's text w/ the corresponding translation (Public)
   *
   * @param {Object} data - Dictionary data
   */
  function translate(data) {
    var translationMap = {};
    var langTranslation = {};

    if (typeof data !== 'undefined') {
      dictionaryData = data;
    }

    translationMap = getWidgetTranslatables(dictionaryData.dictionary);
    langTranslation = translationMap[dictionaryData.to];

    for (const key in langTranslation) {
      var translationProp = langTranslation[key];
      for (const translationPropKey in translationProp) {
        var elemProp = translationProp[translationPropKey];
        var element = document.querySelector(`.${elemProp.id}`);

        if (element !== null) {
          var value = translationProp[translationPropKey].translation;
          var propType = translationProp[translationPropKey].property;
          if (value !== undefined && value !== '') {
            var requiredStar = false;
            var requiredEl = element.getElementsByClassName('required');

            if (requiredEl.length > 0) {
              requiredStar = requiredEl[0].cloneNode(true);
              requiredEl[0].remove();
            }
            element[propType] = value;
            if (requiredStar) {
              element.append(requiredStar);
            }
          }
        }
      }
    }
  }

  /**
   * Get translation for specific text (Public)
   *
   * @param {Object} data - Dictionary data
   * @param {String} text - Translatable text
   * @param {String} translateTo - Language
   */
  function getTranslation(data, text, translateTo) {
    if (typeof data === 'undefined' || typeof text === 'undefined') {
      return false;
    }

    var dict = data.dictionary;
    var lang = (typeof translateTo !== 'undefined') ? translateTo : 'en';
    var translations = dict[lang];

    try {
      return translations[text];
    } catch (e) {
      return false;
    }
  }

  /**
   * Get translatable text via 'translatable' class name (Private)
   *
   * @param {Object} dict - Dictionary data
   */
  function getWidgetTranslatables(dict) {
    var translatables = {};
    var translations = {};

    document.querySelectorAll('.translatable').forEach(element => {
      var elemType = element.tagName.toLowerCase();
      var elemTranslatableProps = elementTextLookup[elemType];
      var uniqueID = generateID();
      var elemProp = [];

      if (element.classList.contains('_uidset') === false) {
        if (elemTranslatableProps !== undefined) {
          elemTranslatableProps.forEach(item => {
            var text = element[item];
            if (typeof text !== 'undefined' && text.length !== 0 && text !== '') {
              if (isNaN(text)) {
                elemProp.push({
                  id: uniqueID,
                  property: item,
                  text: text
                });
              }
            }
          });
        } else { // Use default 'innerText' property to get element's text
          if (typeof element.innerText !== 'undefined' && element.innerText.length !== 0 && element.innerText !== '') {
            if (isNaN(element.innerText)) {
              var childNodes = Array.from(element.children);
              var hasRequireSpan = childNodes && childNodes.length > 0 && !!childNodes.find(el => el.tagName === 'SPAN' && el.innerText === '*' && el.classList.contains('required'));
              elemProp.push({
                id: uniqueID,
                property: 'innerText',
                text: hasRequireSpan ? element.innerText.replace(/\n\*/, '') : element.innerText
              });
            }
          }
        }

        if (elemProp.length !== 0) {
          translatables[uniqueID] = elemProp;
          element.classList.add(uniqueID);
          element.classList.add('_uidset');
        }
      }
    });

    if (Object.keys(translationStore).length === 0) {
      translationStore = translatables;
      translations = mapTranslation(translatables, dict);
    } else {
      var merged = Object.assign(translationStore, translatables);
      translationStore = merged;
      translations = mapTranslation(merged, dict);
    }

    return translations;
  }

  /**
   * Create a translation map (Private)
   *
   * @param {Object} translatables - Translatable text
   * @param {Object} dict - Dictionary data
   */
  function mapTranslation(translatables, dict) {
    var customDictionary = {};
    for (var key in dict) {
      var languageTranslation = dict[key];
      customDictionary[key] = [];

      for (var translatable in translatables) {
        var elemProp = translatables[translatable];
        var elemPropStore = [];
        for (var propKey in elemProp) {
          var elemProperties = elemProp[propKey];
          elemPropStore.push({
            translation: languageTranslation[elemProperties.text],
            id: elemProperties.id,
            property: elemProperties.property
          });
        }
        customDictionary[key][translatable] = elemPropStore;
      }
    }
    return customDictionary;
  }

  /**
   * ID generator (Private)
   *
   * https://gist.github.com/gordonbrander/2230317
   */
  function generateID() {
    return `_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Exposed method(s)
  lang.translate = translate;
  lang.getTranslatables = getTranslatables;
  lang.setDictionary = setDictionary;
  lang.getDictionary = getDictionary;
  lang.getTranslation = getTranslation;

  return lang;
}());
return JFWidgetTranslation;
}
export default createWidgetTranslations;
