import {observable} from 'mobx';

export interface ITodoStore {
    todos: string[];
    filter: string;
}
class TodoStore implements ITodoStore{
    @observable todos = ["buy milk", "buy eggs"];
    @observable filter = "";
}

const store = new TodoStore();

export default store;

