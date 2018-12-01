declare module 'mobx-router' {
    import { object } from "prop-types";
    export function startRouter(routes: RoutesConfig, store: any): void;

    export class MobxRouter extends React.Component {};

    export class RouterStore extends object {
        goTo: any;
    };

    export type RoutesConfig = {[index: string]: Route};

    export class Route {
        readonly path: string;
        readonly component: JSX.Element;
        readonly onEnter?: (route: Route, params: any, store: any, queryParams: any) => void;
        readonly onBeforeEnter?: (route: any, params: any, store: any) => boolean;
        readonly beforeExit?: () => boolean;
        readonly onParamsChange: (route: any, params: any, store: any) => void;
        readonly title?: string;

        constructor(routeConfig: {
            path: string,
            component: JSX.Element,
            onEnter?: Route["onEnter"],
            beforeExit?: Route["beforeExit"],
            onParamsChange?: Route["onParamsChange"],
            onBeforeEnter?:  Route["onBeforeEnter"];
            title?: string
        });
    }
}