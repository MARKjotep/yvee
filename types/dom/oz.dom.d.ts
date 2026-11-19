import { CATT } from "./cat.dom";
export declare class OZ {
    private events;
    private states;
    private windowEvents;
    private documentEvents;
    private resetST;
    private resetEV;
    get keys(): string[];
    set(catt: CATT): this;
    push(_OZ: this): this;
    stage(): Promise<this>;
    get processWindowEvents(): this;
    get processDocumentEvents(): this;
    reset(id: string[]): this;
    RPS(oz?: this): Promise<this>;
}
export declare const Wizard: OZ;
