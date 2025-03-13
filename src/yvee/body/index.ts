import { $ } from "../../$";
import {
  $$,
  _htmlHead,
  head,
  headAttr,
  headType,
  isArr,
  isNotWindow,
  oAss,
  obj,
  oLen,
} from "../../@";
import { dom, Dom } from "../../dom";

export class doc<
  T extends { args?: Record<string, any>; data?: Record<string, any> } = Record<
    string,
    any
  >,
> extends head {
  lang?: string;
  import?: any;
  _data: T["data"] = {};
  constructor(
    public path: string,
    public args: T["args"] = {},
    public id: string,
    public status: number = 200,
  ) {
    super();
  }
  async fetch?(): Promise<Record<string, any>>;
  head?(): Promise<void> | void;
  body?(): Promise<Dom> | Dom;
  async loader() {
    if (this.import) {
      try {
        const cimp = await this.import;
        if (cimp.default) {
          this.import = await cimp.default({ ...this.args, ...this.data });
        } else {
          this.import = undefined;
        }
      } catch (error) {
        $$.p = error;
        this.import = undefined;
      }
    }

    if (this.body) {
      //
      const CD = await this.body();
      return isArr(CD) ? CD : [CD];
    }

    if (this.import) {
      const CD = this.import;
      return isArr(CD) ? CD : [CD];
    }

    return [];
  }

  getHeadAttr(head: headAttr = {}, ...toMap: headType[]) {
    //
    const rh = new _htmlHead();

    if (oLen(head)) rh.head = head;

    rh.id = this.id;

    const TORA = rh.head;

    toMap.forEach((tf) => {
      TORA.map(tf);
    });

    DOC(rh, this as doc);

    return TORA;
  }
  set data(data: obj<any>) {
    oAss(this._data as {}, data);
  }
  get data(): T["data"] {
    return this._data;
  }
}

export class defaultError extends doc<{}> {
  head(): Promise<void> | void {
    this.title = `error ${this.status}`;
  }
  body(): Promise<Dom> | Dom {
    return dom("div", {}, this.path + " not found...");
  }
}

function DOC(rh: _htmlHead, doc: doc) {
  const { link, script, meta, title, base, description, css } = doc;
  rh.head = {
    title,
    base,
    meta,
    link,
    script,
  };

  if (description) {
    rh.head = {
      meta: [
        {
          name: "description",
          content: description,
        },
      ],
    };
  }

  if (css) {
    const isc = isArr(css) ? css : [css];
    const mp = isc.map((mm) => ({
      rel: `preload stylesheet`,
      href: mm,
      as: "style",
    }));

    rh.head = {
      link: [...mp],
    };
  }
}
