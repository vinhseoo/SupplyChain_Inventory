---
name: frontend-table
description: Skill để xây dựng data table với Ant Design Table. Bao gồm pagination, filter, sort, và export patterns.
---

# Frontend Table — Data Table Pattern

## Standard DataTable Usage

```tsx
import { Table, Input, Button, Space, Tag } from 'antd';
import { SearchOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

export const SupplierListPage = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useSuppliers({ page, size: 20, search });

  const columns: ColumnsType<SupplierResponse> = [
    {
      title: 'Mã NCC',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      sorter: true,
    },
    {
      title: 'Tên NCC',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Ngừng'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: true,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Quản lý Nhà cung cấp"
      extra={
        <Space>
          <Button icon={<DownloadOutlined />}>Export</Button>
          <Button type="primary" icon={<PlusOutlined />}>Thêm mới</Button>
        </Space>
      }
    >
      {/* Search bar */}
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm theo tên, mã..."
          allowClear
          onSearch={setSearch}
          style={{ width: 320 }}
        />
      </div>

      {/* Table */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.data?.content}
        loading={isLoading}
        scroll={{ x: 1000 }}
        pagination={{
          current: page + 1,
          pageSize: 20,
          total: data?.data?.totalElements,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bản ghi`,
          onChange: (p) => setPage(p - 1),
        }}
      />
    </PageContainer>
  );
};
```

## Column Patterns

### Text with ellipsis
```tsx
{ title: 'Name', dataIndex: 'name', ellipsis: true }
```

### Date formatting
```tsx
{ title: 'Date', render: (d) => dayjs(d).format('DD/MM/YYYY') }
```

### Status tag
```tsx
{ title: 'Status', render: (s) => <Tag color={statusColors[s]}>{statusLabels[s]}</Tag> }
```

### Currency
```tsx
{ title: 'Amount', render: (v) => `${v?.toLocaleString('vi-VN')} ₫` }
```

### Actions
```tsx
{ title: 'Actions', fixed: 'right', width: 120, render: (_, record) => <Space>...</Space> }
```

## Rules
- `rowKey="id"` bắt buộc
- `scroll={{ x: minWidth }}` cho responsive horizontal scroll
- Pagination: `showSizeChanger`, `showTotal`
- Page index: backend dùng 0-based, Ant Design dùng 1-based → chuyển đổi
- Fixed columns: action column `fixed: 'right'`
- Date columns: format DD/MM/YYYY HH:mm (locale Việt Nam)
- Currency columns: `toLocaleString('vi-VN')` + ₫
