import React from 'react';
import $ from 'jquery';

window.jQuery = $;
window.$ = $;
global.jQuery = $;

const MemosDefault = React.lazy(() => import('./pages/Memos'));
const Login = React.lazy(() => import('./pages/Authentication'));

const routes = [
    { path: '/memos', exact: true, name: 'Default', component: MemosDefault, auth: false },
    { path: '/login', exact: true, name: 'Login', component: Login, auth: true}
];

export default routes;