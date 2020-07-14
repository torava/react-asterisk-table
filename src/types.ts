export interface Column {
  id: string;
  label?: string;
  property?: Function | string;
  formatter?: Function;
  columns?: Column[];
  class?: string;
}

export type Id = string | number;