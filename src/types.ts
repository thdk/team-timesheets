export interface IReactProps {
    children?: Array<React.ReactChild> | React.ReactChild
}

export type Overwrite<T1, T2> = Pick<T1, Exclude<keyof T1, keyof T2>> & T2;