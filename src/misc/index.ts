import { isArr, oAss, obj, oKeys } from "../@";

const reClass = (a: attr, classes: string[]) => {
  const _cl: any[] = classes;
  if (a?.class) {
    _cl.push(...(isArr(a.class) ? a.class : [a.class]));
  }
  return _cl.filter((cf) => cf);
};
