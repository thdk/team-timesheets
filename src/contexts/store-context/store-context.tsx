import React, { createContext } from 'react';
import { IRootStore } from "../../stores/root-store";

export const StoreContext = createContext<IRootStore>({} as IRootStore);


export const StoreProvider = StoreContext.Provider;

export const useStore = () => React.useContext(StoreContext);
