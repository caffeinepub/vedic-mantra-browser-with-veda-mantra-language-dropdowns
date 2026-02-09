import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Diagnostics {
    samaveda48Exists: boolean;
    mantraCount: bigint;
    metadataCount: bigint;
    samaveda47Exists: boolean;
}
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
    addMantraAudioFile(veda: Veda, mantraNumber: bigint, blob: ExternalBlob): Promise<void>;
    getAllMantraNumbersForVeda(veda: Veda): Promise<Array<bigint>>;
    getBackendDiagnostics(): Promise<Diagnostics>;
    getMantraAudioFile(veda: Veda, mantraNumber: bigint): Promise<ExternalBlob | null>;
    getMantraMeaning(veda: Veda, mantraNumber: bigint, language: Language): Promise<string | null>;
    getMantraMetadata(veda: Veda, mantraNumber: bigint, language: Language): Promise<string | null>;
    getMantraNumbers(veda: Veda): Promise<Array<bigint>>;
    getMantraTemplate(veda: Veda, mantraNumber: bigint): Promise<string | null>;
    getMantraText(veda: Veda, mantraNumber: bigint, language: Language): Promise<string | null>;
    submitTemplate(veda: Veda, mantraNumber: bigint, template: string): Promise<Array<bigint>>;
}
