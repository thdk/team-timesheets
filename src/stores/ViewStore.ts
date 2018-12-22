import { observable, IObservableArray, action, computed, transaction, reaction } from "mobx";
import moment from 'moment-es6';
import { IRootStore } from "./RootStore";
import { Doc } from "../Firestorable/Document";
import { goToLogin } from "../internal";

export interface IViewAction {
  icon: string;
  action: () => void;
}

export interface INavigationViewAction extends IViewAction {
  icon: "menu" | "arrow_back" | "arrow_upward";
}

export interface IViewStore {
  title: string;
  isDrawerOpen: boolean;
  day?: number;
  month?: number;
  year?: number;
  readonly moment: moment.Moment;
  readonly monthMoment: moment.Moment;
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
  @observable day?: number;
  @observable month?: number;
  @observable year?: number;

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

    reaction(() => rootStore.user.user, user => {
      if (!(user instanceof(Doc))) {
        goToLogin(rootStore);
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
}