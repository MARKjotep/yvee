import type { CATT } from "./cat.dom";
export declare class OZ {
    private readonly tokens;
    private events;
    private states;
    private windowEvents;
    private documentEvents;
    private resetST;
    private resetEV;
    get keys(): string[];
    set(catt: CATT): this;
    push(_OZ: this): this;
    stage(isCurrent?: () => boolean): Promise<this>;
    get processWindowEvents(): this;
    get processDocumentEvents(): this;
    reset(id: string[]): this;
    resetScope(prefix: string): this;
    RPS(oz?: this, isCurrent?: () => boolean): Promise<this>;
}
export declare const Wizard: OZ;
