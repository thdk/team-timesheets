import { observable, action, computed, transaction, ObservableMap, makeObservable } from "mobx";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  readonly selectionLimit?: number;
  readonly condition?: (keys: string[]) => boolean;
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

export type IViewStore = ViewStore;

export class ViewStore implements IViewStore {
  private readonly _actions = observable<IViewAction>([]);
  readonly selection = observable(new Map<string, true>());
  readonly fabs = observable<IFab>([]);
  readonly rootStore: IRootStore;

  navigationAction: INavigationViewAction = {} as INavigationViewAction;
  title = "";
  isDrawerOpenField = window.innerWidth > 600;
  day: number | null = null;
  month: number | null = null;
  year: number | null = null;

  public track?: boolean;
  private disposables: (() => void)[] = [];

  constructor(rootStore: IRootStore, testDate?: Date) {
    makeObservable(this, {
      navigationAction: observable,
      title: observable,
      isDrawerOpenField: observable,
      day: observable,
      month: observable,
      year: observable,
      setViewDate: action,
      setNavigation: action,
      setIsDrawerOpen: action,
      isDrawerOpen: computed,
      moment: computed,
      startOfDay: computed,
      endOfDay: computed,
      monthMoment: computed,
      setActions: action,
      actions: computed,
      setFabs: action,
      removeAction: action,
      toggleSelection: action
    });

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
    const onKeyDown = (ev: KeyboardEvent) => {
      // Exit 'contextual mode' of top app bar
      // by clearing the selection when escape key pressed
      if (!this.selection) {
        throw new Error("Foo");
      }
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

      if (!action) {
        return;
      }


      if (isActionWithSelection(action)) {
        if (0 < action.selection.size && action.selection.size <= (action.selectionLimit ?? Infinity)) {
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

    document.addEventListener("keydown", onKeyDown);

    this.disposables.push(
      () => document.removeEventListener("keydown", onKeyDown),
    );
  }

  public get actions() {
    const contextual = !!Array.from(this.selection.keys()).length;

    const actions = this._actions.filter(a => (
      !!a.contextual === contextual
    ) && (
        (a.selection ?? this.selection).size <= (a.selectionLimit || Infinity)
      )
    );

    return actions;
  }

  public setViewDate(
    {
      year,
      month,
      day,
    }: {
      year: number,
      month: number,
      day?: number | null,
    }
  ) {
    transaction(() => {
      this.day = day || null;
      this.month = month;
      this.year = year;
    })
  }

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

  setIsDrawerOpen(isOpen: boolean) {
    this.isDrawerOpenField = isOpen;
  }

  public get isDrawerOpen() {
    return !!(
      this.rootStore.auth.activeDocumentId
      && this.isDrawerOpenField
    );
  }

  get moment() {
    if (this.day)
      return moment(`${this.year}-${this.month}-${this.day}`, 'YYYY-MM-DD');
    else
      return this.monthMoment;
  }

  get startOfDay() {
    if (this.year === null || this.month === null || this.day === null) {
      return null;
    }

    const start = new Date(Date.UTC(this.year, this.month - 1, this.day));

    return start;
  }

  get endOfDay() {
    if (!this.startOfDay) {
      return null;
    }
    const end = new Date(this.startOfDay);
    end.setUTCHours(23, 59, 59, 999);

    return end;
  }

  get monthMoment() {
    return moment(`${this.year}-${this.month}`, 'YYYY-MM');
  }

  setActions(actions: IViewAction[]) {
    this._actions.replace(actions);
  }

  setFabs(fabs: IFab[]) {
    this.fabs.replace(fabs);
  }

  removeAction(action: IViewAction) {
    this._actions.remove(action);
  }

  toggleSelection(id: string) {
    this.selection.has(id)
      ? this.selection.delete(id)
      : this.selection.set(id, true);
  }

  public dispose() {
    this.disposables.reverse().forEach(d => d());
    transaction(() => {
      this.selection.clear();
      this._actions.clear();
      this.fabs.clear();
    });
  }
}
