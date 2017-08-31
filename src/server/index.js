import configureStore from '../common/store/configureStore';
import express from 'express';
import { fetchCounter } from '../common/api/counter';
import qs from 'qs';
import { renderToString } from 'react-dom/server';
import serialize from 'serialize-javascript';

import React from 'react';
import { Provider } from 'react-redux';
import App from '../common/components/App';
import { JssProvider } from 'react-jss';
import { MuiThemeProvider } from 'material-ui/styles';
import { sheetsManager, theme, sheetsRegistry, jss } from '../common/styles';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();

server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    fetchCounter(apiResult => {
      // Read the counter from the request, if provided
      const params = qs.parse(req.query);
      const counter = parseInt(params.counter, 10) || apiResult || 0;

      // Compile an initial state
      const preloadedState = { counter };

      // Create a new Redux store instance
      const store = configureStore(preloadedState);

      // Render the component to a string
      const markup = renderToString(
        <Provider store={store}>
          <JssProvider registry={sheetsRegistry} jss={jss}>
            <MuiThemeProvider sheetsManager={sheetsManager} theme={theme}>
              <App />
            </MuiThemeProvider>
          </JssProvider>
        </Provider>
      );

      const css = sheetsRegistry.toString();

      // Grab the initial state from our Redux store
      const finalState = store.getState();

      res.send(`<!doctype html>
    <html lang="">
    <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet='utf-8' />
        <title>Razzle Redux Example</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="//fonts.googleapis.com/css?family=Roboto:300,400,500">
        ${assets.client.css
          ? `<link rel="stylesheet" href="${assets.client.css}">`
          : ''}
        ${css ? `<style id='jss-ssr'>${css}</style>` : ''}
        ${process.env.NODE_ENV === 'production'
          ? `<script src="${assets.client.js}" defer></script>`
          : `<script src="${assets.client.js}" defer crossorigin></script>`}
    </head>
    <body>
        <div id="root">${markup}</div>
        <script>
          window.__PRELOADED_STATE__ = ${serialize(finalState)}
        </script>
    </body>
</html>`);
    });
  });

export default server;
