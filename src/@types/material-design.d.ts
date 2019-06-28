declare module '@material/chips/index';
declare module '@material/textfield/index';
declare module '@material/select/index';
declare module '@material/drawer/index';
declare module '@material/top-app-bar/index';
declare module '@material/tab-bar/index';
declare module '@material/ripple/index';
declare module '@material/checkbox/index';
declare module '@material/icon-toggle/index';
declare module '@material/icon-button/index';
declare module '@material/switch/index';

interface HTMLElementEventMap {
    "MDCIconToggle:change": { detail: { isOn: boolean } } & Event
}