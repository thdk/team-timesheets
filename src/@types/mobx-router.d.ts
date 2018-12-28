declare module 'mobx-router' {
    import { object } from "prop-types";
    export function startRouter(routes: RoutesConfig, store: any): void;

    export class MobxRouter extends React.Component {};

    export class RouterStore extends object {
        params: any;
        currentPath: any;
        queryParams: any;
        goTo: any;
    };

    export type RoutesConfig = {[index: string]: Route};

    export class Route {
        readonly path: string;
        readonly component: JSX.Element;
        readonly onEnter?: (route: Route, params: any, store: any, queryParams: any) => void;
        readonly beforeEnter?: (route: Route, params: any, store: any) => boolean;
        readonly beforeExit?: (route: Route, params: any, store: any) => void | false;
        readonly onParamsChange: (route: Route, params: any, store: any, queryParams: any) => void;
        readonly title?: string;

        constructor(routeConfig: {
            path: string,
            component: JSX.Element,
            onEnter?: Route["onEnter"],
            beforeExit?: Route["beforeExit"],
            onParamsChange?: Route["onParamsChange"],
            beforeEnter?:  Route["onBeforeEnter"];
            title?: string
        });
    }
}