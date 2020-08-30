import * as React from 'react';
import { Route } from 'mobx-router';
import { RegistrationsPage } from '../../pages/registrations';
import { transaction, IKeyValueMap } from 'mobx';
import { setNavigationContent, goToRouteWithDate } from '../actions';
import { App } from '../../internal';
import { IRootStore } from '../../stores/root-store';
import { IViewAction } from '../../stores/view-store';
import { IRegistration } from '../../../common/dist';
import detailRoutes from "./detail";
import { goToFavorite } from '../favorites/detail';

export type DateObject = {
    year: number;
    month: number;
    day?: number;
};

export const path = "/timesheets";

type RegistrationsOverviewRoute = Route<IRootStore, DateObject, { last: string }>;

export const goToOverview = (s: Pick<IRootStore, "router" | "view"> , date?: DateObject, trackOptions?: { track?: boolean, currentDate?: number }) => {
    let route = routes.monthOverview;
    if ((date && date.day) || (!date && s.view.day)) {
        route = routes.overview;
        trackOptions = { ...trackOptions, currentDate: undefined };
    }

    goToRouteWithDate(route, s, date, trackOptions);
};

const routeChanged = (route: RegistrationsOverviewRoute, params: DateObject, s: IRootStore) => {
    setNavigationContent(s, route, !!s.view.track, s.view.track && s.view.moment ? { year: s.view.year!, month: s.view.month! } : undefined, params.day ? +params.day : undefined);

    transaction(() => {
        s.view.year = +params.year;
        s.view.month = +params.month;
        s.view.day = params.day ? +params.day : undefined;
    });
};

const setActions = (s: IRootStore, alowInserts = false) => {
    const actions: IViewAction[] = [
        {
            action: selection => {
                if (!selection) return;
                transaction(() => {
                    s.timesheets.clipboard.replace(
                        Array.from(selection.keys())
                            .reduce((map, id) => {
                                const registration = s.timesheets.getRegistrationById(id);
                                if (registration) {
                                    map[id] = { ...registration };
                                }

                                return map;
                            }, {} as IKeyValueMap<IRegistration>));
                    s.view.selection.clear();
                });
            },
            icon: { content: "content_copy", label: "Copy" },
            shortKey: { ctrlKey: true, key: "c" },
            selection: s.view.selection,
            contextual: true
        },
        {
            action: selection => {
                if (!selection) return;

                s.timesheets.deleteRegistrationsAsync(...Array.from(selection.keys()));
                s.view.selection.clear();
            },
            icon: { content: "delete", label: "Delete" },
            shortKey: { key: "Delete", ctrlKey: true },
            selection: s.view.selection,
            contextual: true
        } as IViewAction<IRegistration>,
        {
            action: selection => {
                if (!selection) return;
                let groupId: string | undefined;
                transaction(() => {
                    groupId = s.favorites.addFavorites(
                        // registrations
                        Array.from(selection.keys())
                            .reduce((registrations, id) => {
                                const registration = s.timesheets.getRegistrationById(id);
                                if (registration) {
                                    registrations.push(registration);
                                }

                                return registrations;
                            }, [] as IRegistration[]),
                        // group
                        {
                            name: "Favorite"
                        },
                    );
                    s.view.selection.clear();
                });

                groupId && goToFavorite(s, groupId);
            },
            icon: { content: "favorite", label: "Favorite" },
            shortKey: { ctrlKey: false, key: "f" },
            selection: s.view.selection,
            contextual: true
        },
    ];


    if (alowInserts) {
        actions.push({
            action: selection => {
                if (!selection) return;

                console.log(s.view.moment.toDate());
                s.timesheets.addRegistrationsAsync(
                    Array.from(selection.values())
                        .map(reg =>
                            s.timesheets.copyRegistrationToDate(reg, s.view.moment.toDate())
                        )
                );
            },
            icon: { content: "content_paste", label: "Paste" },
            shortKey: { ctrlKey: true, key: "v" },
            selection: s.timesheets.clipboard
        } as IViewAction<IRegistration>);
    }

    else {
        actions.push(
            {
                action: () => {
                    s.timesheets.setRegistrationsGroupedByDaySortOrder(s.timesheets.registrationsGroupedByDaySortOrder * -1)
                },
                icon: { content: "arrow_downward", label: "Sort ascending" },
                iconActive: { content: "arrow_upward", label: "Sort descending" },
                isActive: s.timesheets.registrationsGroupedByDaySortOrder === 1
            } as IViewAction<IRegistration>,
            {
                action: () => {
                    s.timesheets.areGroupedRegistrationsCollapsed = !s.timesheets.areGroupedRegistrationsCollapsed;
                },
                icon: { content: "unfold_more", label: "Unfold groups" },
                iconActive: { content: "unfold_less", label: "Fold groups" },
                isActive: s.timesheets.areGroupedRegistrationsCollapsed === false
            }
        )
    }

    transaction(() => {
        s.view.setActions(actions);
        s.view.setFabs([{
            action: () => {
                s.router.goTo(detailRoutes.newRegistration);
            },
            icon: {
                content: "add",
                label: "Add new registration"
            },
            shortKey: {
                key: "a",
            },
        }]);
    });
};

const beforeTimesheetExit = (_route: RegistrationsOverviewRoute, _params: any, s: IRootStore) => {
    transaction(() => {
        s.view.selection.size && s.view.selection.clear();
        s.view.setActions([]);
        s.view.setFabs([]);
    });
};

const routes = {
    overview: new Route({
        path: path + '/:year/:month/:day',
        component: <App><RegistrationsPage></RegistrationsPage></App>,
        onEnter: (route: RegistrationsOverviewRoute, params: DateObject, s: IRootStore) => {
            routeChanged(route, params, s);
            setActions(s, true);
        },
        onParamsChange: routeChanged,
        title: "Timesheet",
        beforeExit: beforeTimesheetExit
    }),
    monthOverview: new Route({
        path: path + '/:year/:month',
        component: <App><RegistrationsPage></RegistrationsPage></App>,
        onEnter: (route: RegistrationsOverviewRoute, params: DateObject, s: IRootStore) => {
            s.view.track = false;
            routeChanged(route, params, s);
            setActions(s);
        },
        onParamsChange: routeChanged,
        title: "Timesheet",
        beforeExit: beforeTimesheetExit
    })
};

export default routes;


