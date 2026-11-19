import { Mapper } from "@/utils";
import { Idm } from "./idm.dom";
import { OZ } from "./oz.dom";
export declare class CATT {
    xid: string;
    IDM: Idm;
    map: Mapper<string, string[]>;
    states: ((id: string) => Promise<() => void>)[];
    events: Mapper<string, (...arg: any) => any>;
    OZ: OZ;
    private internalId?;
    constructor(xid: string, IDM?: Idm, _OZ?: OZ);
    attr_push(key: string, val: any, pre?: string): void;
    get attr(): string;
    set id(id: string);
    get id(): string | undefined;
    setId(id: string): void;
}
