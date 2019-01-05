import { observable, action, transaction, computed, toJS } from "mobx";
import { ICollection, Collection } from "../Firestorable/Collection";
import { Doc } from "../Firestorable/Document";
import { firestorable } from "../Firestorable/Firestorable";
import { IRootStore } from "./RootStore";
import * as deserializer from '../serialization/deserializer';
import * as serializer from '../serialization/serializer';

export interface IUserStore {
    userId?: string;
    user: (Doc<IUser> & Pick<firebase.User, "email" | "displayName">) | undefined;
    setUser: (fbUser: firebase.User | null) => void;
    save: () => void;
}

export interface IRoles {
    admin?: boolean;
    user?: boolean;
}

export interface IUser {
    tasks: Map<string, true>;
    roles: IRoles;
    name: string;
    defaultTask?: string;
}

export interface IUserData {
    tasks?: string[];
    roles?: IRoles;
    name?: string;
    defaultTask: string;
}

export enum StoreState {
    Done,
    Pending,
    Error
}

export class UserStore implements IUserStore {
    // private rootStore: IRootStore;
    @observable.ref userId?: string;
    @observable.ref fbUser?: firebase.User
    @observable state = StoreState.Done;

    private readonly users: ICollection<IUser>;
    constructor(rootStore: IRootStore) {
        // this.rootStore = rootStore;
        this.users = new Collection(rootStore.getCollection.bind(this, "users"), {
            realtime: true,
            serialize: serializer.convertUser,
            deserialize: deserializer.convertUser
        });

        firestorable.auth.onAuthStateChanged(this.setUser.bind(this));

        // TODO: this is not good. we only need a single user!
        this.users.getDocs();
    }

    public save() {
        if (!this.user) return;

        const userData = toJS(this.user.data!);

        // TODO: implement canChangeUserRoles (Only admin can change user roles!)
        // if (!rules.canChangeUserRoles(this.user))
        delete userData.roles;

        // TODO: this currently only updates the user tasks
        // TODO: should allow partial updates? (Since firestore allows that)

        this.users.updateAsync(this.user.id, {
            ...userData, ...{
                tasks: this.user.data!.tasks || {},
                defaultTask: userData.defaultTask
            }
        });
    }

    @computed public get user() {

        if (this.userId && this.fbUser) {
            const user = this.users.docs.get(this.userId);
            return user
                ? Object.assign(user, { email: this.fbUser.email, displayName: this.fbUser.displayName })
                : undefined;
        }

        return undefined;
    }

    @action
    public setUser(fbUser: firebase.User | null) {
        if (!fbUser) {
            this.userId = undefined; // userid should be observable ref?
        }
        else {
            this.state = StoreState.Pending;
            this.users.getAsync(fbUser.uid).then(user => {
                // Check if existing user
                if (user) {
                    this.getUserSuccess(user, fbUser);
                }
                else {
                    // register new user
                    this.users.addAsync(
                        {
                            roles: { user: true },
                            name: fbUser.displayName || "",
                            tasks: new Map()
                        }
                        , fbUser.uid).then(() => {
                            // get the newly registered user
                            return this.users.getAsync(fbUser.uid).then(user => {
                                if (!user) throw new Error("No user found after registration");
                                this.getUserSuccess(user, fbUser);
                            }, this.getUserError);
                        }, error => console.log(`${error}\nCoudn't save newly registered user. `));
                }
            }, this.getUserError);
        }
    }

    @action.bound
    getUserSuccess = (user: Doc<IUser>, fbUser: firebase.User) => {
        this.state = StoreState.Done;
        transaction(() => {
            this.userId = user.id;
            this.fbUser = fbUser;
        });
    }

    @action.bound
    getUserError = (error: any) => {
        console.log(error);
        this.state = StoreState.Error;
    }

}