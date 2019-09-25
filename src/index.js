import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore } from 'redux';
import logger from 'redux-logger'
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App/index';
import * as serviceWorker from './serviceWorker';
import reducer from './store/reducer';
import 'bootstrap/dist/css/bootstrap.min.css';

const store = createStore(
  reducer,
  applyMiddleware(logger)
);

const app = (
    <Provider store={store}>
        <BrowserRouter>
            {/* basename="/arweave sounds" */}
            <App />
        </BrowserRouter>
    </Provider>
);

ReactDOM.render(app, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
