import { createContext } from 'react';
import { IRootStore } from "../../stores/root-store";

export const StoreContext = createContext<IRootStore>({} as IRootStore);
