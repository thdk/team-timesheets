export interface IConfig {
    readonly value: ConfigValue;
    readonly key: string;
}

export type ConfigValue = string | number | (string | number)[]