import * as React from 'react';
import * as ReactDOM from 'react-dom'

import {Provider} from 'mobx-react';
import {MobxRouter, startRouter} from 'mobx-router';
import views from './config/views';
import store from './store';

startRouter(views, store);

ReactDOM.render(
    React.createElement(
        Provider, 
        {store}, 
        React.createElement(MobxRouter)
    ), document.getElementById("root")
);
