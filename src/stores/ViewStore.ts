import { observable, IObservableArray, action, computed, transaction, reaction, ObservableMap } from "mobx";
import moment from 'moment-es6';
import { IRootStore } from "./RootStore";
import { goToLogin } from "../internal";
import { IIconData } from "../mdc/buttons/iconButtons";

export interface IShortKey {
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  key: string;
}

export const isActionWithSelection = (action: IViewAction | IFab): action is IViewAction => {
  return !!(action as any).selection;
};

export interface IViewAction<T = any> {
  readonly icon: IIconData;
  readonly iconActive?: IIconData;
  readonly isActive?: boolean | (() => boolean);
  readonly action: (selection?: Map<string, T>) => void;
  readonly shortKey?: IShortKey;
  readonly contextual?: boolean;
  readonly selection?: ObservableMap<string, any>;
}

export interface IFab {
  readonly icon: IIconData;
  readonly action: () => void;
  readonly shortKey?: IShortKey;
}

export interface INavigationViewAction extends IViewAction {
  icon: { label: "Menu", content: "menu" } | { label: "Back", content: "arrow_back" } | { label: "Up", content: "arrow_upward" };
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
  readonly fabs: IObservableArray<IFab>;
  readonly selection: ObservableMap<string, true>;
  readonly toggleSelection: (id: string, data: any) => void;
  navigationAction?: INavigationViewAction;
  setActions: (actions: IViewAction[]) => void;
  setFabs: (fabs: IFab[]) => void;
  setNavigation: (action: INavigationViewAction | "default") => void;
  removeAction: (action: IViewAction) => void;
}

export class ViewStore implements IViewStore {
  readonly actions = observable<IViewAction>([]);
  readonly selection = observable(new Map<string, true>());
  readonly fabs = observable<IFab>([]);

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
    this.isDrawerOpen = true;

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
      // Exit 'contextual mode' of top app bar
      // by clearing the selection when escape key pressed
      if (this.selection.size && ev.key === "Escape") {
        this.selection.clear();
        return;
      }

      const filterByShortKey = <T extends { shortKey?: IShortKey }>(items: (T[])) => {
        return items.filter(a => {
          const { key = undefined, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false } = a.shortKey || {};
          return a.shortKey &&
            altKey === ev.altKey &&
            ctrlKey === ev.ctrlKey &&
            metaKey === ev.metaKey &&
            shiftKey === ev.shiftKey &&
            key === ev.key
        })[0];
      };

      const action = filterByShortKey([...this.fabs, ...this.actions]);

      if (action) {
        ev.preventDefault();
        ev.stopPropagation();
        if (isActionWithSelection(action)){
          action.action(action.selection);
        }
        else {
          action.action();
        }
      }
    });
  }

  @action
  public setNavigation(action: INavigationViewAction | "default") {
    this.navigationAction = action === "default"
      ? {
        action: () => {
          this.rootStore.view.isDrawerOpen = !this.rootStore.view.isDrawerOpen;
        },
        icon: { content: "menu", label: "Menu" },
      }
      : action;
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

  @action setFabs(fabs: IFab[]) {
    this.fabs.replace(fabs);
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