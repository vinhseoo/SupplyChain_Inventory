import { Table } from 'antd';
import type { TableProps } from 'antd';

interface DataTableProps<T> extends TableProps<T> {
  // Add custom props here if needed in the future
}

export function DataTable<T extends object>({
  rowKey = 'id',
  pagination,
  scroll = { x: 1000 },
  ...props
}: DataTableProps<T>) {
  const mergedPagination = pagination === false ? false : {
    pageSize: 20,
    showSizeChanger: true,
    showTotal: (total: number) => `Tổng cộng ${total} dòng`,
    size: 'small' as const,
    ...pagination,
  };

  return (
    <Table<T>
      rowKey={rowKey}
      pagination={mergedPagination}
      scroll={scroll}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      {...props}
    />
  );
}
