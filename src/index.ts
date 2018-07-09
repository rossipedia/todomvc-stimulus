import { Application } from 'stimulus';
import { definitionsFromContext } from '@stimulus/webpack-helpers';

const app = Application.start();
const context = require.context('./controllers/', true, /\.[tj]s$/);
app.load(definitionsFromContext(context));

window['app'] = app;
