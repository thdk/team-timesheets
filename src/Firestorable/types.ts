import { Overwrite } from "../types";

export type OptionalId<T> = Overwrite<T, {id?: string}>

export interface IDisposable {
    dispose: () => void;
}