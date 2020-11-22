import { observable, action, computed, transaction, ObservableMap } from "mobx";
import moment from 'moment';
import { IRootStore } from "../root-store";

export interface IShortKey {
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  key: string;
}

export const isActionWithSelection = (action: IViewAction | IFab): action is IViewAction & { selection: string[] } => {
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

interface IIconData {
  label: string;
  content: string;
}

export interface IFab {
  readonly icon: IIconData;
  readonly action: () => void;
  readonly shortKey?: IShortKey;
}

export interface INavigationViewAction extends IViewAction {
  icon: { label: "Menu", content: "menu" } | { label: "Back", content: "arrow_back" } | { label: "Up", content: "arrow_upward" };
}

export interface IViewStore extends ViewStore { };

export class ViewStore implements IViewStore {
  readonly actions = observable<IViewAction>([]);
  readonly selection = observable(new Map<string, true>());
  readonly fabs = observable<IFab>([]);
  readonly rootStore: IRootStore;

  @observable navigationAction: INavigationViewAction = {} as INavigationViewAction;
  @observable title = "";
  @observable isDrawerOpenField = window.innerWidth > 600;
  @observable day?: number;
  @observable month?: number;
  @observable year?: number;

  public track?: boolean;

  constructor(rootStore: IRootStore, testDate?: Date) {
    this.rootStore = rootStore;

    const date = testDate || new Date();
    this.setViewDate({
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });

    this.setNavigation("default");

    this.init();
  }

  private init() {
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
        if (isActionWithSelection(action)) {
          if (action.selection.size) {
            ev.preventDefault();
            ev.stopPropagation();
            action.action(action.selection);
          }
        }
        else {
          ev.preventDefault();
          ev.stopPropagation();
          action.action();
        }
      }
    });
  }

  @action
  public setViewDate({
    year,
    month,
    day,
  }: {
    year: number,
    month: number,
    day?: number | undefined,
  }) {
    transaction(() => {
      this.day = day;
      this.month = month;
      this.year = year;
    })
  }

  @action
  public setNavigation(action: INavigationViewAction | "default") {
    this.navigationAction = action === "default"
      ? {
        action: () => {
          this.setIsDrawerOpen(!this.isDrawerOpen);
        },
        icon: { content: "menu", label: "Menu" },
      }
      : action;
  }

  @action
  setIsDrawerOpen(isOpen: boolean) {
    this.isDrawerOpenField = isOpen;
  }

  @computed
  public get isDrawerOpen() {
    return !!(
      this.rootStore.auth.activeDocumentId
      && this.isDrawerOpenField
    );
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

  @action toggleSelection(id: string) {
    this.selection.has(id)
      ? this.selection.delete(id)
      : this.selection.set(id, true);
  }
}