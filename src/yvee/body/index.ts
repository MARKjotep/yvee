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

export class doc<T = Record<string, string>> extends head {
  lang?: string;
  import?: any;
  _data: T = {} as T;
  constructor(
    public path: string,
    public args: T = {} as T,
    public id: string,
    public status: number = 200,
  ) {
    super();
  }
  async fetch?(): Promise<Record<string, string>>;
  head(): Promise<void> | void {
    this.title = "error " + this.status;
  }
  body(): Promise<Dom> | Dom {
    return dom("div", {}, this.path + " not found...");
  }
  async loader() {
    if (this.import) {
      try {
        const cimp = await this.import;
        if (cimp.default) {
          const CD = await cimp.default({ ...this.args, ...this.data });

          return isArr(CD) ? CD : [CD];
        }
      } catch (error) {
        $$.p = error;
        const CD = await this.body();
        return isArr(CD) ? CD : [CD];
      }
    } else {
      const CD = await this.body();
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
  get data(): T {
    return this._data;
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
    const mp = css.map((mm) => ({
      rel: `${isNotWindow ? "preload " : ""}stylesheet`,
      href: mm,
      as: "style",
    }));
    rh.head = {
      link: [...mp],
    };
  }
}
