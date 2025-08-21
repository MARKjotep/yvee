import { getHead, headType, makeID } from "../../@";

export class HTML {
  lang: string;
  head: string = "";
  constructor(lang: string, htmlHead?: headType) {
    this.lang = lang;
    if (htmlHead) {
      this.head = getHead(htmlHead);
    }
  }
  body(ctx: string, id?: string, attr?: string) {
    return [
      `<!DOCTYPE html><html lang="${this.lang}">`,
      `<head>${this.head}</head>`,
      `<body id="${id}"${attr ? " " + attr : ""}>${ctx}</body>`,
      "</html>",
    ].join("");
  }
}
