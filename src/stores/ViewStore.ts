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

export interface IViewAction<T = any> {
  readonly icon: string;
  readonly action: (selection?: Map<string, T>) => void;
  readonly shortKey?: IShortKey;
  readonly contextual?: boolean;
  readonly selection?: ObservableMap<string, any>;
}

export interface INavigationViewAction extends IViewAction {
  icon: "menu" | "arrow_back" | "arrow_upward";
}

export interface IViewStore {
  title: string;
  isDrawerOpen: boolean;

  // todo: day, month and year should be set with an action setDate(year, month, day)
  day?: number;
  month?: number;
  year?: number;

  track?: boolean;

  readonly moment: moment.Moment;
  readonly monthMoment: moment.Moment;
  readonly actions: IObservableArray<IViewAction>;
  readonly selection: ObservableMap<string, true>;
  readonly toggleSelection: (id: string, data: any) => void;
  navigationAction?: INavigationViewAction;
  setActions: (actions: IViewAction[]) => void;
  setNavigation: (action: INavigationViewAction | "default") => void;
  removeAction: (action: IViewAction) => void;
}

export class ViewStore implements IViewStore {
  readonly actions = observable<IViewAction>([]);
  readonly selection = observable(new Map<string, true>());

  @observable navigationAction?: INavigationViewAction;
  @observable readonly title: string;
  @observable readonly isDrawerOpen: boolean;
  @observable day?: number;
  @observable month?: number;
  @observable year?: number;

  public track?: boolean;

  private readonly rootStore: IRootStore;

  constructor(rootStore: IRootStore) {
    this.rootStore = rootStore;

    const date = new Date();
    this.title = "";
    this.isDrawerOpen = false;

    transaction(() => {
      this.day = date.getDate();
      this.month = date.getMonth() + 1;
      this.year = date.getFullYear();
    })

    this.setNavigation("default");

    this.init();
  }

  private init() {
    // redirect to login when user logs out
    reaction(() => this.rootStore.user.userId, userId => {
      if (!userId) {
        goToLogin(this.rootStore);
      }
    });

    // listen for keyboard event which can fire viewactions
    document.addEventListener("keydown", ev => {
      const viewAction = this.actions.filter(a => {
        const { key = undefined, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false } = a.shortKey || {};
        return a.shortKey &&
          altKey === ev.altKey &&
          ctrlKey === ev.ctrlKey &&
          metaKey === ev.metaKey &&
          shiftKey === ev.shiftKey &&
          key === ev.key
      })[0];

      if (viewAction) {
        ev.preventDefault();
        ev.stopPropagation();
        viewAction.action(viewAction.selection);
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

  @action toggleSelection(id: string, data: any) {
    this.selection.has(id)
      ? this.selection.delete(id)
      : this.selection.set(id, data);
  }
}