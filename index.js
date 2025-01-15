// File: index.js
import {
  createCustomWidget,
  createWidgetTranslations,
  createWidgetUtils,
  injectPostMessage,
} from '@jotforminc/widgets-js-sdk';

injectPostMessage();

const JFCustomWidget = createCustomWidget();
const JFWidgetTranslation = createWidgetTranslations();
const JFCustomWidgetUtils = createWidgetUtils();

window.JFCustomWidget = JFCustomWidget;
window.JFWidgetTranslation = JFWidgetTranslation;
window.JFCustomWidgetUtils = JFCustomWidgetUtils;

export default {
  JFWidgetTranslation,
  JFCustomWidget,
  JFCustomWidgetUtils,
};
