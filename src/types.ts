import { ReactNode } from "react";

export interface IReactProps {
    children?: ReactNode;
    style?: React.CSSProperties;
}

export type Overwrite<T1, T2> = Pick<T1, Exclude<keyof T1, keyof T2>> & T2;