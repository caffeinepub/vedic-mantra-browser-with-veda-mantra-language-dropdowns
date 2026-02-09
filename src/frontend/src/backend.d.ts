import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export enum Language {
    hindi = "hindi",
    telugu = "telugu",
    english = "english"
}
export enum Veda {
    atharvaVeda = "atharvaVeda",
    samaVeda = "samaVeda",
    yajurVeda = "yajurVeda",
    rikVeda = "rikVeda"
}
export interface backendInterface {
    getMantraMeaning(veda: Veda, mantraNumber: bigint, language: Language): Promise<string | null>;
    getMantraNumbers(veda: Veda): Promise<Array<bigint>>;
    getMantraText(veda: Veda, mantraNumber: bigint, language: Language): Promise<string | null>;
}
