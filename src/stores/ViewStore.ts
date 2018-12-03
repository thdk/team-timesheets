import { observable, IObservableArray, action, computed } from "mobx";
import { IRootStore } from "../store";

import moment from 'moment-es6';

export interface IViewAction {
  icon: string;
  action: () => void;
  isActive: boolean;
}

export interface IViewStore {
  title: string;
  isDrawerOpen: boolean;
  day: number;
  month: number;
  year: number;
  moment: moment.Moment;
  readonly actions: IObservableArray<IViewAction>;
  setActions: (actions: IViewAction[]) => void;
}

export class ViewStore implements IViewStore {
  readonly actions = observable<IViewAction>([]);
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
    this.month = date.getMonth();
    this.year = date.getFullYear();
  }

  @computed get moment() {
    return moment(`${this.year}-${this.month}-${this.day}`, 'YYYY-MM-DD');
  }

  @action setActions(actions: IViewAction[]) {
    this.actions.replace(actions);
  }
}