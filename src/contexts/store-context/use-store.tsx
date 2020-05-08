import React from "react";
import { StoreContext } from "./store-context";

export const useStore = () => React.useContext(StoreContext);