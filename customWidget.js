// File: customWidget.js
import { createCustomWidget } from '@jotforminc/widgets-js-sdk';

const JFCustomWidget = createCustomWidget();

JFCustomWidget.subscribe('ready', () => {
  console.log('Widget is ready.');

  // Notify JotForm that the widget has initialized
  JFCustomWidget.sendData({ initialized: true });

  // Trigger auto-submit after a delay
  setTimeout(() => {
    console.log('Attempting to auto-submit...');
    try {
      JFCustomWidget.sendSubmit({
        valid: true, // Indicates the widget is valid
        value: 'Auto-submitted by widget', // Placeholder value
      });
      console.log('Form submission triggered successfully.');
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  }, 3000); // Adjust delay (3 seconds)
});

export default JFCustomWidget;
