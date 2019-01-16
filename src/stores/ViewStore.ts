import { observable, IObservableArray, action, computed, transaction, reaction, ObservableMap } from "mobx";
import moment from 'moment-es6';
import { IRootStore } from "./RootStore";
import { goToLogin } from "../internal";

export interface IShortKey {
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  key: string;
}

export interface IViewAction {
  icon: string;
  action: (ids?: string[]) => void;
  shortKey?: IShortKey;
}

export interface INavigationViewAction extends IViewAction {
  icon: "menu" | "arrow_back" | "arrow_upward";
}

export type CalendarDetail = "month" | "year" | "decade" | "century";

export interface IViewStore {
  title: string;
  isDrawerOpen: boolean;
  day?: number;
  month?: number;
  year?: number;
  calendarDetail: CalendarDetail;
  setCalendarDetail: (detail: CalendarDetail) => void;
  readonly moment: moment.Moment;
  readonly monthMoment: moment.Moment;
  readonly actions: IObservableArray<IViewAction>;
  readonly selection: ObservableMap<string>;
  navigationAction?: INavigationViewAction;
  setActions: (actions: IViewAction[]) => void;
  setNavigation: (action: INavigationViewAction | "default") => void;
  removeAction: (action: IViewAction) => void;
}

export class ViewStore implements IViewStore {
  readonly actions = observable<IViewAction>([]);
  readonly selection = observable<string>(new Map());

  @observable navigationAction?: INavigationViewAction;
  @observable readonly title: string;
  @observable readonly isDrawerOpen: boolean;
  @observable day?: number;
  @observable month?: number;
  @observable year?: number;
  @observable calendarDetail: CalendarDetail;

  private readonly rootStore: IRootStore;

  constructor(rootStore: IRootStore) {
    this.rootStore = rootStore;

    const date = new Date();
    this.title = "";
    this.isDrawerOpen = false;
    this.calendarDetail = "month";

    transaction(() => {
      this.day = date.getDate();
      this.month = date.getMonth() + 1;
      this.year = date.getFullYear();
    })

    this.setNavigation("default");

    reaction(() => rootStore.user.userId, userId => {
      if (!userId) {
        goToLogin(rootStore);
      }
    });

    document.addEventListener("keydown", ev => {
      const action = this.actions.filter(a => {
        const { key = undefined, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false } = a.shortKey || {};
        return a.shortKey &&
          altKey === ev.altKey &&
          ctrlKey === ev.ctrlKey &&
          metaKey === ev.metaKey &&
          shiftKey === ev.shiftKey &&
          key === ev.key
      }).map(a => a.action)[0];

      if (action) {
        ev.preventDefault();
        ev.stopPropagation();
        action(Array.from(this.selection.keys()));
      }
    });
  }

  @action
  public setNavigation(action: INavigationViewAction | "default") {
    this.navigationAction = action === "default" ? {
      action: () => {
        this.rootStore.view.isDrawerOpen = !this.rootStore.view.isDrawerOpen;
      },
      icon: "menu",
    } : action;
  }

  @computed get moment() {
    if (this.day)
      return moment(`${this.year}-${this.month}-${this.day}`, 'YYYY-MM-DD');
    else
      return this.monthMoment;
  }

  @computed get monthMoment() {
    return moment(`${this.year}-${this.month}`, 'YYYY-MM');
  }

  @action setActions(actions: IViewAction[]) {
    this.actions.replace(actions);
  }

  @action removeAction(action: IViewAction) {
    this.actions.remove(action);
  }

  @action setCalendarDetail(detail: CalendarDetail) {
    this.calendarDetail = detail;
  }
}