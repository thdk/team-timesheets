import { observable, IObservableArray, action, computed } from "mobx";
import { IRootStore } from "../store";

import moment from 'moment-es6';

export interface IViewAction {
  icon: string;
  action: () => void;
  isActive: boolean;
}

export interface INavigationViewAction extends IViewAction {
  icon: "menu" | "arrow_back" | "arrow_upward";
}

export interface IViewStore {
  title: string;
  isDrawerOpen: boolean;
  day: number;
  month: number;
  year: number;
  moment: moment.Moment;
  readonly actions: IObservableArray<IViewAction>;
  navigationAction?: INavigationViewAction;
  setActions: (actions: IViewAction[]) => void;
  setNavigation: (action: INavigationViewAction | "default") => void;
  removeAction: (action: IViewAction) => void;
}

export class ViewStore implements IViewStore {
  readonly actions = observable<IViewAction>([]);
  @observable navigationAction?: INavigationViewAction;
  @observable readonly title: string;
  @observable readonly isDrawerOpen: boolean;
  @observable readonly day: number;
  @observable readonly month: number;
  @observable readonly year: number;

  private readonly rootStore: IRootStore;

  constructor(rootStore: IRootStore) {
    this.rootStore = rootStore;

    const date = new Date();
    this.title = "";
    this.isDrawerOpen = false;
    this.day = date.getDate();
    this.month = date.getMonth() + 1;
    this.year = date.getFullYear();

    this.setNavigation("default");
  }

  @action
  public setNavigation(action: INavigationViewAction | "default") {
    this.navigationAction = action === "default" ? {
      action: () => {
        this.rootStore.view.isDrawerOpen = !this.rootStore.view.isDrawerOpen;
      },
      icon: "menu",
      isActive: false,
    } : action;
  }

  @computed get moment() {
    return moment(`${this.year}-${this.month}-${this.day}`, 'YYYY-MM-DD');
  }

  @action setActions(actions: IViewAction[]) {
    this.actions.replace(actions);
  }

  @action removeAction(action: IViewAction) {
    this.actions.remove(action);
  }
}