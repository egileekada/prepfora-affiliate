import type { ReactNode } from "react";

export type ColumnType = "text" | "number" | "currency" | "date" | "custom";

export interface Column<T> {
  id: string;
  name: string;
  type?: ColumnType;
  isRowHeader?: boolean;
  render?: (value: unknown, item: T) => ReactNode;
}

export interface CustomTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  rows: T[];
  rowKey: keyof T;

  emptyText?: string;
  paginated?: boolean;

  // only needed when paginated
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  rowsPerPage?: number;

  // isLoading reserved for later
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
  tableClassName?: string;
  rowClassName?: string;
  headerRowClassName?: string;
  headerCellClassName?: string;
}
