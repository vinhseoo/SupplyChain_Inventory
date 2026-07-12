import { useState } from 'react';
import { 
  Tabs, 
  Card, 
  Button, 
  Input, 
  Space, 
  Form, 
  Select, 
  Tag, 
  Popconfirm, 
  message, 
  Tooltip,
  Tree,
  Modal,
  Upload,
  Empty,
  InputNumber,
  Row,
  Col
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  DownloadOutlined, 
  UploadOutlined,
  BarcodeOutlined,
  FolderOpenOutlined,
  TagsOutlined,
  InboxOutlined,
  MinusCircleOutlined,
  UndoOutlined
} from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import { 
  useProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct, 
  useImportProducts,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUoms,
  useCreateUom,
  useUpdateUom,
  useDeleteUom
} from '../hooks/useProducts';
import { productService } from '@/services/productService';
import { useAuthStore } from '@/stores/authStore';
import type { 
  ProductResponse, 
  ProductRequest, 
  CategoryResponse, 
  CategoryRequest, 
  UnitOfMeasureResponse, 
  UnitOfMeasureRequest,
  ProductImportSummary
} from '@/types';

export const ProductListPage = () => {
  const { hasPermission } = useAuthStore();
  const [activeTab, setActiveTab] = useState('products');
  
  // Lists filters/paging
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState<number | undefined>(undefined);
  const [productUom, setProductUom] = useState<number | undefined>(undefined);
  const [productPage, setProductPage] = useState(0);
  const [productPageSize, setProductPageSize] = useState(20);

  const handleResetProductFilters = () => {
    setProductSearch('');
    setProductCategory(undefined);
    setProductUom(undefined);
    setProductPage(0);
  };
  
  const [uomSearch, setUomSearch] = useState('');
  const [uomPage, setUomPage] = useState(0);
  const [uomPageSize, setUomPageSize] = useState(20);

  const [categorySearch, setCategorySearch] = useState('');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [productFormTab, setProductFormTab] = useState('basic');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [categoryParentNode, setCategoryParentNode] = useState<CategoryResponse | null>(null);

  const [isUomModalOpen, setIsUomModalOpen] = useState(false);
  const [selectedUom, setSelectedUom] = useState<UnitOfMeasureResponse | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileList, setImportFileList] = useState<any[]>([]);
  const [importSummary, setImportSummary] = useState<ProductImportSummary | null>(null);

  // Forms
  const [productForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [uomForm] = Form.useForm();

  // Queries
  const { data: productsData, isLoading: isProductsLoading } = useProducts({
    page: productPage,
    size: productPageSize,
    search: productSearch,
    categoryId: productCategory,
    uomId: productUom
  });

  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories(categorySearch);
  const { data: uomsData, isLoading: isUomsLoading } = useUoms({
    page: uomPage,
    size: uomPageSize,
    search: uomSearch
  });

  // Mutations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const importProductsMutation = useImportProducts();

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const createUomMutation = useCreateUom();
  const updateUomMutation = useUpdateUom();
  const deleteUomMutation = useDeleteUom();

  // Excel handlers
  const handleExportProducts = async () => {
    try {
      const blob = await productService.exportExcel({
        search: productSearch,
        categoryId: productCategory,
        uomId: productUom
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Xuất file Excel thành công');
    } catch (err) {
      message.error('Không thể xuất Excel sản phẩm.');
    }
  };

  const handleImportSubmit = () => {
    if (importFileList.length === 0) {
      message.error('Vui lòng chọn file Excel.');
      return;
    }
    const file = importFileList[0];
    importProductsMutation.mutate(file, {
      onSuccess: (res) => {
        setImportSummary(res.data);
        setImportFileList([]);
      }
    });
  };

  // Product Modal handlers
  const handleOpenCreateProduct = () => {
    setSelectedProduct(null);
    setProductFormTab('basic');
    productForm.resetFields();
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (record: ProductResponse) => {
    setSelectedProduct(record);
    setProductFormTab('basic');
    
    // Map object properties to Array for Form.List
    const initialProps = record.properties
      ? Object.entries(record.properties).map(([k, v]) => ({ key: k, value: v }))
      : [];

    productForm.setFieldsValue({
      code: record.code,
      name: record.name,
      sku: record.sku,
      barcode: record.barcode,
      categoryId: record.categoryId,
      uomId: record.uomId,
      price: record.price,
      minimumStock: record.minimumStock,
      maximumStock: record.maximumStock,
      description: record.description,
      propertiesList: initialProps
    });
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
    productForm.resetFields();
  };

  const handleProductSubmit = async () => {
    try {
      const values = await productForm.validateFields();
      
      // Convert Array properties back to Object Map for backend JSONB
      const propertiesMap: Record<string, any> = {};
      if (values.propertiesList) {
        values.propertiesList.forEach((item: { key: string; value: any }) => {
          if (item && item.key && item.key.trim() !== '') {
            propertiesMap[item.key.trim()] = item.value;
          }
        });
      }

      const payload: ProductRequest = {
        code: values.code,
        name: values.name,
        sku: values.sku,
        barcode: values.barcode,
        categoryId: values.categoryId,
        uomId: values.uomId,
        price: values.price,
        minimumStock: values.minimumStock,
        maximumStock: values.maximumStock,
        description: values.description,
        properties: propertiesMap,
        isActive: selectedProduct ? values.isActive : true
      };

      if (selectedProduct) {
        updateProductMutation.mutate(
          { id: selectedProduct.id, data: payload },
          { onSuccess: () => handleCloseProductModal() }
        );
      } else {
        createProductMutation.mutate(payload, {
          onSuccess: () => handleCloseProductModal()
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Category Modal handlers
  const handleOpenCreateCategory = (parent: CategoryResponse | null) => {
    setSelectedCategory(null);
    setCategoryParentNode(parent);
    categoryForm.resetFields();
    categoryForm.setFieldsValue({
      parentId: parent?.id || undefined
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (node: CategoryResponse) => {
    setSelectedCategory(node);
    setCategoryParentNode(null);
    categoryForm.resetFields();
    categoryForm.setFieldsValue({
      code: node.code,
      name: node.name,
      parentId: node.parentId || undefined,
      description: node.description,
      isActive: node.isActive
    });
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
    setCategoryParentNode(null);
    categoryForm.resetFields();
  };

  const handleCategorySubmit = async () => {
    try {
      const values = await categoryForm.validateFields();
      const payload: CategoryRequest = {
        ...values,
        parentId: values.parentId || null,
        isActive: selectedCategory ? values.isActive : true
      };

      if (selectedCategory) {
        updateCategoryMutation.mutate(
          { id: selectedCategory.id, data: payload },
          { onSuccess: () => handleCloseCategoryModal() }
        );
      } else {
        createCategoryMutation.mutate(payload, {
          onSuccess: () => handleCloseCategoryModal()
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // UOM Modal handlers
  const handleOpenCreateUom = () => {
    setSelectedUom(null);
    uomForm.resetFields();
    setIsUomModalOpen(true);
  };

  const handleOpenEditUom = (record: UnitOfMeasureResponse) => {
    setSelectedUom(record);
    uomForm.resetFields();
    uomForm.setFieldsValue({
      code: record.code,
      name: record.name,
      description: record.description,
      isActive: record.isActive
    });
    setIsUomModalOpen(true);
  };

  const handleCloseUomModal = () => {
    setIsUomModalOpen(false);
    setSelectedUom(null);
    uomForm.resetFields();
  };

  const handleUomSubmit = async () => {
    try {
      const values = await uomForm.validateFields();
      const payload: UnitOfMeasureRequest = {
        ...values,
        isActive: selectedUom ? values.isActive : true
      };

      if (selectedUom) {
        updateUomMutation.mutate(
          { id: selectedUom.id, data: payload },
          { onSuccess: () => handleCloseUomModal() }
        );
      } else {
        createUomMutation.mutate(payload, {
          onSuccess: () => handleCloseUomModal()
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Format Category Tree
  const buildCategoryTreeData = (flatCategories: CategoryResponse[]): any[] => {
    const map = new Map<number, any>();
    const roots: any[] = [];

    flatCategories.forEach(cat => {
      map.set(cat.id, {
        key: cat.id,
        title: (
          <div className="flex items-center justify-between group py-1 pr-4" style={{ minWidth: 260 }}>
            <span className="flex items-center gap-2">
              <FolderOpenOutlined className="text-amber-500" />
              <span className="font-semibold text-gray-800">{cat.code}</span>
              <span className="text-gray-500 text-xs">({cat.name})</span>
              {!cat.isActive && <Tag color="error">Ngừng</Tag>}
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-4">
              <Space size="small">
                {hasPermission('POST:/api/categories') && (
                  <Tooltip title="Thêm danh mục con">
                    <Button 
                      type="text" 
                      size="small"
                      icon={<PlusOutlined style={{ color: '#52c41a' }} />} 
                      onClick={(e) => { e.stopPropagation(); handleOpenCreateCategory(cat); }}
                    />
                  </Tooltip>
                )}
                {hasPermission('PUT:/api/categories/{id}') && (
                  <Tooltip title="Chỉnh sửa">
                    <Button 
                      type="text" 
                      size="small"
                      icon={<EditOutlined style={{ color: '#1677ff' }} />} 
                      onClick={(e) => { e.stopPropagation(); handleOpenEditCategory(cat); }}
                    />
                  </Tooltip>
                )}
                {cat.isActive && hasPermission('DELETE:/api/categories/{id}') && (
                  <Popconfirm
                    title="Xóa danh mục này và tất cả con của nó?"
                    okText="Đồng ý"
                    cancelText="Hủy"
                    onConfirm={() => deleteCategoryMutation.mutate(cat.id)}
                  >
                    <Button 
                      type="text" 
                      size="small"
                      danger
                      icon={<DeleteOutlined />} 
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                )}
              </Space>
            </span>
          </div>
        ),
        children: []
      });
    });

    flatCategories.forEach(cat => {
      const node = map.get(cat.id);
      if (cat.parentId) {
        const parentNode = map.get(cat.parentId);
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const formattedCategoryTree = categoriesData ? buildCategoryTreeData(categoriesData) : [];

  // Table Columns Definitions
  const productColumns: ColumnsType<ProductResponse> = [
    {
      title: 'Mã SP',
      dataIndex: 'code',
      key: 'code',
      width: 110,
      render: (code) => <span className="font-semibold text-gray-800">{code}</span>,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name) => <span className="font-medium text-gray-900">{name}</span>,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 120,
      render: (val) => val || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 140,
      render: (val) => val || <span className="text-gray-400">—</span>,
    },
    {
      title: 'ĐVT',
      dataIndex: 'uomName',
      key: 'uomName',
      width: 80,
      render: (val) => val || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Giá bán (VND)',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => <span className="font-medium">{Number(price).toLocaleString('vi-VN')} ₫</span>,
    },
    {
      title: 'Định mức tồn',
      key: 'stockLimit',
      width: 130,
      render: (_, record) => (
        <span className="text-xs text-gray-600">
          Min: {Number(record.minimumStock)} | Max: {Number(record.maximumStock)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'} style={{ borderRadius: 6 }}>
          {isActive ? 'Hoạt động' : 'Ngừng'}
        </Tag>
      ),
    },
  ];

  const canProductEdit = hasPermission('PUT:/api/products/{id}');
  const canProductDelete = hasPermission('DELETE:/api/products/{id}');

  if (canProductEdit || canProductDelete) {
    productColumns.push({
      title: 'Hành động',
      key: 'action',
      width: 110,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {canProductEdit && (
            <Tooltip title="Chỉnh sửa">
              <Button 
                type="text" 
                icon={<EditOutlined style={{ color: '#1677ff' }} />} 
                onClick={() => handleOpenEditProduct(record)} 
              />
            </Tooltip>
          )}
          {record.isActive && canProductDelete && (
            <Popconfirm
              title="Ngừng bán sản phẩm này?"
              onConfirm={() => deleteProductMutation.mutate(record.id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Tooltip title="Ngừng bán">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    });
  }

  const uomColumns: ColumnsType<UnitOfMeasureResponse> = [
    {
      title: 'Mã ĐVT',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (code) => <span className="font-semibold text-gray-800">{code}</span>,
    },
    {
      title: 'Tên ĐVT',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span className="font-medium text-gray-900">{name}</span>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (val) => val || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'} style={{ borderRadius: 6 }}>
          {isActive ? 'Hoạt động' : 'Ngừng'}
        </Tag>
      ),
    },
  ];

  const canUomEdit = hasPermission('PUT:/api/units-of-measure/{id}');
  const canUomDelete = hasPermission('DELETE:/api/units-of-measure/{id}');

  if (canUomEdit || canUomDelete) {
    uomColumns.push({
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {canUomEdit && (
            <Tooltip title="Chỉnh sửa">
              <Button 
                type="text" 
                icon={<EditOutlined style={{ color: '#1677ff' }} />} 
                onClick={() => handleOpenEditUom(record)} 
              />
            </Tooltip>
          )}
          {record.isActive && canUomDelete && (
            <Popconfirm
              title="Vô hiệu hóa đơn vị tính này?"
              onConfirm={() => deleteUomMutation.mutate(record.id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Tooltip title="Vô hiệu hóa">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    });
  }

  // Tabs layout
  const tabItems = [
    {
      key: 'products',
      label: (
        <span>
          <BarcodeOutlined />
          Sản phẩm / SKUs
        </span>
      ),
      children: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
            <Space wrap>
              <Input
                placeholder="Tìm mã, tên, SKU, barcode..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{ width: 260, borderRadius: 8 }}
                allowClear
              />
              <Select
                placeholder="Chọn danh mục..."
                value={productCategory}
                onChange={setProductCategory}
                style={{ width: 180 }}
                allowClear
                options={categoriesData?.map(c => ({ label: c.name, value: c.id }))}
              />
              <Select
                placeholder="Chọn đơn vị tính..."
                value={productUom}
                onChange={setProductUom}
                style={{ width: 150 }}
                allowClear
                options={uomsData?.content?.map(u => ({ label: u.name, value: u.id }))}
              />
              <Button 
                icon={<UndoOutlined />} 
                onClick={handleResetProductFilters}
                style={{ borderRadius: 8 }}
              >
                Xóa bộ lọc
              </Button>
            </Space>
            <Space>
              {hasPermission('POST:/api/products/import') && (
                <Button 
                  icon={<UploadOutlined />} 
                  onClick={() => { setImportSummary(null); setImportFileList([]); setIsImportModalOpen(true); }}
                  style={{ borderRadius: 8 }}
                >
                  Nhập Excel
                </Button>
              )}
              {hasPermission('GET:/api/products/export') && (
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={handleExportProducts}
                  style={{ borderRadius: 8 }}
                >
                  Xuất Excel
                </Button>
              )}
              {hasPermission('POST:/api/products') && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleOpenCreateProduct}
                  style={{ borderRadius: 8 }}
                >
                  Thêm sản phẩm
                </Button>
              )}
            </Space>
          </div>

          <DataTable
            columns={productColumns}
            dataSource={productsData?.content || []}
            loading={isProductsLoading}
            pagination={{
              total: productsData?.totalElements || 0,
              pageSize: productPageSize,
              current: productPage + 1,
              onChange: (p, size) => {
                setProductPage(p - 1);
                if (size) setProductPageSize(size);
              },
            }}
          />
        </div>
      )
    },
    {
      key: 'categories',
      label: (
        <span>
          <FolderOpenOutlined />
          Danh mục sản phẩm
        </span>
      ),
      children: (
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Card title="Tìm kiếm & Cấu hình" className="shadow-xs rounded-xl mb-4">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Input
                  placeholder="Lọc danh mục hàng..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  allowClear
                  style={{ borderRadius: 8 }}
                />
                {hasPermission('POST:/api/categories') && (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => handleOpenCreateCategory(null)}
                    block
                    style={{ borderRadius: 8 }}
                  >
                    Thêm danh mục gốc
                  </Button>
                )}
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={16}>
            <Card title="Cấu trúc cây danh mục" className="shadow-xs rounded-xl">
              {isCategoriesLoading ? (
                <div className="text-center py-8 text-gray-500">Đang tải danh mục...</div>
              ) : formattedCategoryTree.length > 0 ? (
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 overflow-auto max-h-[500px]">
                  <Tree
                    showLine={{ showLeafIcon: false }}
                    showIcon={false}
                    selectable={false}
                    defaultExpandAll
                    treeData={formattedCategoryTree}
                  />
                </div>
              ) : (
                <Empty description="Không tìm thấy danh mục nào." className="py-8" />
              )}
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'uoms',
      label: (
        <span>
          <TagsOutlined />
          Đơn vị tính (UOM)
        </span>
      ),
      children: (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
            <Input
              placeholder="Tìm mã, tên ĐVT..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={uomSearch}
              onChange={(e) => setUomSearch(e.target.value)}
              style={{ width: 300, borderRadius: 8 }}
              allowClear
            />
            {hasPermission('POST:/api/units-of-measure') && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleOpenCreateUom}
                style={{ borderRadius: 8 }}
              >
                Thêm đơn vị tính
              </Button>
            )}
          </div>

          <DataTable
            columns={uomColumns}
            dataSource={uomsData?.content || []}
            loading={isUomsLoading}
            pagination={{
              total: uomsData?.totalElements || 0,
              pageSize: uomPageSize,
              current: uomPage + 1,
              onChange: (p, size) => {
                setUomPage(p - 1);
                if (size) setUomPageSize(size);
              },
            }}
          />
        </div>
      )
    }
  ];

  return (
    <PageContainer title="Danh mục Sản phẩm & Cấu hình">
      <Card bordered={false} className="shadow-xs rounded-xl">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} size="large" />
      </Card>

      {/* Product Add/Edit Modal */}
      <FormModal
        title={selectedProduct ? "Cập nhật sản phẩm" : "Thêm mới sản phẩm"}
        open={isProductModalOpen}
        onClose={handleCloseProductModal}
        onSubmit={handleProductSubmit}
        isLoading={createProductMutation.isPending || updateProductMutation.isPending}
        width={750}
      >
        <Tabs 
          activeKey={productFormTab} 
          onChange={setProductFormTab} 
          size="small"
          items={[
            {
              key: 'basic',
              label: 'Thông tin cơ bản',
              children: (
                <Form form={productForm} layout="vertical" className="mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      name="code"
                      label="Mã sản phẩm"
                      rules={[
                        { required: true, message: 'Mã sản phẩm không được để trống' },
                        { max: 50, message: 'Không vượt quá 50 ký tự' }
                      ]}
                    >
                      <Input placeholder="E.g. PROD-001" disabled={!!selectedProduct} />
                    </Form.Item>

                    <Form.Item
                      name="sku"
                      label="Mã SKU"
                      rules={[
                        { required: true, message: 'Mã SKU không được để trống' },
                        { max: 100, message: 'Không vượt quá 100 ký tự' }
                      ]}
                    >
                      <Input placeholder="E.g. SKU-PROD-001" disabled={!!selectedProduct} />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      name="name"
                      label="Tên sản phẩm"
                      rules={[
                        { required: true, message: 'Tên sản phẩm không được để trống' },
                        { max: 250, message: 'Không vượt quá 250 ký tự' }
                      ]}
                    >
                      <Input placeholder="Tivi Samsung OLED 55 Inch" />
                    </Form.Item>

                    <Form.Item
                      name="barcode"
                      label="Mã Barcode"
                      rules={[{ max: 100, message: 'Không vượt quá 100 ký tự' }]}
                    >
                      <Input placeholder="E.g. 8930123456789" />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      name="categoryId"
                      label="Danh mục hàng hóa"
                      rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                    >
                      <Select placeholder="Chọn danh mục..." allowClear options={categoriesData?.map(c => ({ label: c.name, value: c.id }))} />
                    </Form.Item>

                    <Form.Item
                      name="uomId"
                      label="Đơn vị tính (UOM)"
                      rules={[{ required: true, message: 'Vui lòng chọn đơn vị tính' }]}
                    >
                      <Select placeholder="Chọn đơn vị tính..." allowClear options={uomsData?.content?.map(u => ({ label: u.name, value: u.id }))} />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Form.Item
                      name="price"
                      label="Giá bán (VND)"
                      rules={[{ required: true, message: 'Giá bán không được để trống' }]}
                    >
                      <InputNumber min={0} step={1000} style={{ width: '100%' }} placeholder="Giá bán..." formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value ? (value.replace(/\$\s?|(,*)/g, '') as any) : 0} />
                    </Form.Item>

                    <Form.Item
                      name="minimumStock"
                      label="Định mức tồn Min"
                      rules={[{ required: true, message: 'Không được để trống' }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} placeholder="Min..." />
                    </Form.Item>

                    <Form.Item
                      name="maximumStock"
                      label="Định mức tồn Max"
                      rules={[{ required: true, message: 'Không được để trống' }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} placeholder="Max..." />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="description"
                    label="Mô tả hàng hóa"
                  >
                    <Input.TextArea rows={2} placeholder="Nhập mô tả sản phẩm..." />
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'properties',
              label: 'Thuộc tính mở rộng (JSONB)',
              children: (
                <div className="mt-2">
                  <span className="block text-gray-500 text-xs mb-3">
                    Định nghĩa các thuộc tính mở rộng cho sản phẩm này (E.g. Màu sắc, Kích thước, Cân nặng, Nhiệt độ bảo quản...).
                  </span>
                  
                  <Form form={productForm} layout="vertical">
                    <Form.List name="propertiesList">
                      {(fields, { add, remove }) => (
                        <div className="space-y-2 max-h-[300px] overflow-auto pr-2">
                          {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                              <Form.Item
                                {...restField}
                                name={[name, 'key']}
                                rules={[{ required: true, message: 'Vui lòng điền tên thuộc tính' }]}
                              >
                                <Input placeholder="Tên thuộc tính (E.g. color)" style={{ width: 240 }} />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, 'value']}
                                rules={[{ required: true, message: 'Vui lòng điền giá trị' }]}
                              >
                                <Input placeholder="Giá trị (E.g. Đỏ, 50kg, 2-8°C)" style={{ width: 320 }} />
                              </Form.Item>
                              <MinusCircleOutlined className="text-red-500 hover:text-red-700 cursor-pointer" onClick={() => remove(name)} />
                            </Space>
                          ))}
                          <Form.Item>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                              Thêm thuộc tính
                            </Button>
                          </Form.Item>
                        </div>
                      )}
                    </Form.List>
                  </Form>
                </div>
              )
            }
          ]}
        />
      </FormModal>

      {/* Category Add/Edit Modal */}
      <FormModal
        title={
          selectedCategory 
            ? "Cập nhật Danh mục" 
            : `Thêm Danh mục mới${categoryParentNode ? ` (Con của ${categoryParentNode.code})` : ' (Gốc)'}`
        }
        open={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        onSubmit={handleCategorySubmit}
        isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item name="parentId" noStyle><Input type="hidden" /></Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label="Mã danh mục"
              rules={[
                { required: true, message: 'Mã danh mục không được để trống' },
                { max: 50, message: 'Không vượt quá 50 ký tự' }
              ]}
            >
              <Input placeholder="E.g. ELEC" disabled={!!selectedCategory} />
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên danh mục"
              rules={[
                { required: true, message: 'Tên danh mục không được để trống' },
                { max: 200, message: 'Không vượt quá 200 ký tự' }
              ]}
            >
              <Input placeholder="Thiết bị điện tử" />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ max: 500, message: 'Không vượt quá 500 ký tự' }]}
          >
            <Input.TextArea rows={2} placeholder="Nhập mô tả danh mục..." />
          </Form.Item>
        </Form>
      </FormModal>

      {/* UOM Add/Edit Modal */}
      <FormModal
        title={selectedUom ? "Cập nhật Đơn vị tính" : "Thêm mới Đơn vị tính"}
        open={isUomModalOpen}
        onClose={handleCloseUomModal}
        onSubmit={handleUomSubmit}
        isLoading={createUomMutation.isPending || updateUomMutation.isPending}
      >
        <Form form={uomForm} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label="Mã đơn vị tính"
              rules={[
                { required: true, message: 'Mã đơn vị tính không được để trống' },
                { max: 50, message: 'Không vượt quá 50 ký tự' }
              ]}
            >
              <Input placeholder="E.g. PCS, BOX, KG" disabled={!!selectedUom} />
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên đơn vị tính"
              rules={[
                { required: true, message: 'Tên đơn vị tính không được để trống' },
                { max: 150, message: 'Không vượt quá 150 ký tự' }
              ]}
            >
              <Input placeholder="Cái, Thùng, Hộp, Kilogam" />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ max: 500, message: 'Không vượt quá 500 ký tự' }]}
          >
            <Input.TextArea rows={2} placeholder="Mô tả chi tiết của ĐVT..." />
          </Form.Item>
        </Form>
      </FormModal>

      {/* Excel Import Modal */}
      <Modal
        title={
          <Space>
            <UploadOutlined className="text-blue-500" />
            <span>Nhập danh sách sản phẩm từ Excel</span>
          </Space>
        }
        open={isImportModalOpen}
        onCancel={() => { setIsImportModalOpen(false); setImportSummary(null); setImportFileList([]); }}
        footer={
          importSummary ? (
            <Button type="primary" onClick={() => { setIsImportModalOpen(false); setImportSummary(null); }}>Đóng</Button>
          ) : (
            <Space>
              <Button onClick={() => setIsImportModalOpen(false)}>Hủy</Button>
              <Button type="primary" icon={<UploadOutlined />} loading={importProductsMutation.isPending} onClick={handleImportSubmit}>Tiến hành nhập</Button>
            </Space>
          )
        }
        width={650}
        destroyOnClose
      >
        <div className="py-4 space-y-4">
          {!importSummary ? (
            <>
              <div className="bg-blue-50 p-4 rounded-xl text-gray-700 text-xs border border-blue-100">
                <span className="font-semibold block mb-1">Hướng dẫn chuẩn bị file:</span>
                <ul>
                  <li>File tải lên phải đúng định dạng Excel (.xlsx).</li>
                  <li>Dòng đầu tiên là dòng tiêu đề (Header). Các dòng tiếp theo là dữ liệu.</li>
                  <li>Các cột dữ liệu bắt buộc theo đúng thứ tự: <strong>Mã sản phẩm (A), Tên sản phẩm (B), SKU (C), Barcode (D), Mã danh mục (E), Mã ĐVT (F), Giá bán (G), Tồn tối thiểu (H), Tồn tối đa (I), Mô tả (J)</strong>.</li>
                  <li>Mã danh mục và Mã ĐVT phải khớp chính xác với dữ liệu đã khai báo trên hệ thống.</li>
                </ul>
              </div>

              <Upload.Dragger
                name="file"
                multiple={false}
                fileList={importFileList}
                beforeUpload={(file) => {
                  setImportFileList([file]);
                  return false; // Prevent auto upload
                }}
                onRemove={() => setImportFileList([])}
                accept=".xlsx"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined className="text-blue-500" />
                </p>
                <p className="ant-upload-text text-sm font-medium text-gray-800">Nhấp hoặc kéo thả file Excel vào khu vực này</p>
                <p className="ant-upload-hint text-xs text-gray-500">Chỉ hỗ trợ file định dạng .xlsx</p>
              </Upload.Dragger>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <Card size="small" className="bg-gray-50 rounded-xl">
                  <span className="block text-gray-500 text-xs">Tổng xử lý</span>
                  <span className="font-bold text-lg text-gray-900">{importSummary.totalProcessed}</span>
                </Card>
                <Card size="small" className="bg-green-50 rounded-xl border border-green-100">
                  <span className="block text-green-600 text-xs">Thành công</span>
                  <span className="font-bold text-lg text-green-600">{importSummary.totalSuccess}</span>
                </Card>
                <Card size="small" className="bg-red-50 rounded-xl border border-red-100">
                  <span className="block text-red-600 text-xs">Thất bại</span>
                  <span className="font-bold text-lg text-red-600">{importSummary.totalFailed}</span>
                </Card>
              </div>

              {importSummary.errorDetails && importSummary.errorDetails.length > 0 && (
                <div className="space-y-1">
                  <span className="block font-semibold text-xs text-gray-700">Chi tiết lỗi dòng bị loại bỏ:</span>
                  <div className="bg-red-50/50 p-3 rounded-xl border border-red-100 max-h-[200px] overflow-auto text-xs text-red-700 font-mono space-y-1">
                    {importSummary.errorDetails.map((err, idx) => (
                      <div key={idx}>• {err}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </PageContainer>
  );
};

export default ProductListPage;
