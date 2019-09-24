import React from 'react';
import $ from 'jquery';

window.jQuery = $;
window.$ = $;
global.jQuery = $;

const MemosDefault = React.lazy(() => import('./pages/Memos'));
const Login = React.lazy(() => import('./pages/Authentication'));
const Logout = React.lazy(() => import('./pages/Logout'));

const routes = [
    { path: '/memos', exact: true, name: 'Default', component: MemosDefault, auth: false },
    { path: '/login', exact: true, name: 'Login', component: Login, auth: true},
    { path: '/logout', exact: true, name: 'Logout', component: Logout, auth: false}
];

export default routes;