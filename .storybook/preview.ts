import { initialize, mswLoader } from 'msw-storybook-addon';
import React from 'react';
import './../../app/globals.css';

initialize({
  onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
});
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
    docs: {
      // Instead of JSX, we use the preset layout provided by Storybook
      // This automatically includes Title, Subtitle, Description, Primary, Controls, and Stories
      // in the standard layout

    },
    nextjs: {
      appDirectory: true, // Set to true if your project uses the app directory
    },
    loaders: [mswLoader],
  },
};

export default preview;
