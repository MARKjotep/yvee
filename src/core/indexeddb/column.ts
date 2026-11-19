export type ColumnType = "text" | "integer" | "number" | "boolean" | "date" | "json";

/** Validation and index metadata; IndexedDB itself is schemaless. */
export class Column {
  primaryKey = false;
  required = false;
  isUnique = false;
  indexed = false;
  autoIncrement = false;
  hasDefault = false;
  private defaultValue: unknown;

  constructor(readonly type: ColumnType) {}

  get primary(): this { this.primaryKey = true; return this; }
  get notNull(): this { this.required = true; return this; }
  get index(): this { this.indexed = true; return this; }
  get unique(): this { this.indexed = true; this.isUnique = true; return this; }
  get defaultNow(): this {
    if (this.type !== "date") throw new TypeError("defaultNow requires a timestamp column.");
    return this.default(() => new Date());
  }

  default(value: unknown | (() => unknown)): this {
    this.hasDefault = true;
    this.defaultValue = value;
    return this;
  }

  value(): unknown {
    return typeof this.defaultValue === "function"
      ? this.defaultValue()
      : structuredClone(this.defaultValue);
  }

  validate(name: string, value: unknown): void {
    if (value === undefined || value === null) {
      if (this.required || (this.primaryKey && !this.autoIncrement)) {
        throw new TypeError(`Column '${name}' is required.`);
      }
      return;
    }
    const valid = this.type === "json"
      || (this.type === "text" && typeof value === "string")
      || (this.type === "boolean" && typeof value === "boolean")
      || (this.type === "number" && typeof value === "number" && Number.isFinite(value))
      || (this.type === "integer" && typeof value === "number" && Number.isSafeInteger(value))
      || (this.type === "date" && value instanceof Date && Number.isFinite(value.getTime()));
    if (!valid) throw new TypeError(`Column '${name}' must be ${this.type}.`);
  }
}

export const t = {
  text: () => new Column("text"),
  int: () => new Column("integer"),
  number: () => new Column("number"),
  boolean: () => new Column("boolean"),
  timestamp: () => new Column("date"),
  json: () => new Column("json"),
  serial: () => {
    const column = new Column("integer");
    column.autoIncrement = true;
    return column;
  },
};
