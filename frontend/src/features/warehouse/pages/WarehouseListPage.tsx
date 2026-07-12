import { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  List, 
  Tree, 
  Space, 
  Form, 
  Input, 
  Select, 
  Tag, 
  Popconfirm, 
  Tooltip,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  HomeOutlined, 
  ClusterOutlined, 
  EnvironmentOutlined 
} from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { FormModal } from '@/components/common/FormModal';
import { 
  useWarehouses, 
  useWarehouseTree, 
  useCreateWarehouse, 
  useUpdateWarehouse, 
  useDeleteWarehouse, 
  useCreateLocation, 
  useUpdateLocation, 
  useDeleteLocation 
} from '../hooks/useWarehouses';
import { useAuthStore } from '@/stores/authStore';
import type { WarehouseResponse, WarehouseRequest, LocationNodeResponse, LocationRequest } from '@/types';

export const WarehouseListPage = () => {
  const { hasPermission } = useAuthStore();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  
  // Modals
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseResponse | null>(null);
  
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationNodeResponse | null>(null);
  const [locationParentNode, setLocationParentNode] = useState<LocationNodeResponse | null>(null);
  
  // Forms
  const [warehouseForm] = Form.useForm();
  const [locationForm] = Form.useForm();
  
  // Queries
  const { data: warehousesData, isLoading: isWarehousesLoading } = useWarehouses();
  const { data: treeData, isLoading: isTreeLoading } = useWarehouseTree(selectedWarehouseId);
  
  // Mutations
  const createWarehouseMutation = useCreateWarehouse();
  const updateWarehouseMutation = useUpdateWarehouse();
  const deleteWarehouseMutation = useDeleteWarehouse();
  
  const createLocationMutation = useCreateLocation(selectedWarehouseId);
  const updateLocationMutation = useUpdateLocation(selectedWarehouseId);
  const deleteLocationMutation = useDeleteLocation(selectedWarehouseId);
  
  // Automatically select first warehouse
  useEffect(() => {
    if (warehousesData?.content && warehousesData.content.length > 0 && selectedWarehouseId === null) {
      setSelectedWarehouseId(warehousesData.content[0].id);
    }
  }, [warehousesData, selectedWarehouseId]);

  // Warehouse Handlers
  const handleOpenCreateWarehouse = () => {
    setSelectedWarehouse(null);
    warehouseForm.resetFields();
    setIsWarehouseModalOpen(true);
  };
  
  const handleOpenEditWarehouse = (w: WarehouseResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWarehouse(w);
    warehouseForm.setFieldsValue({
      code: w.code,
      name: w.name,
      address: w.address,
      description: w.description,
      isActive: w.isActive
    });
    setIsWarehouseModalOpen(true);
  };
  
  const handleCloseWarehouseModal = () => {
    setIsWarehouseModalOpen(false);
    setSelectedWarehouse(null);
    warehouseForm.resetFields();
  };
  
  const handleWarehouseSubmit = async () => {
    try {
      const values = await warehouseForm.validateFields();
      const payload: WarehouseRequest = {
        ...values,
        isActive: selectedWarehouse ? values.isActive : true
      };
      
      if (selectedWarehouse) {
        updateWarehouseMutation.mutate(
          { id: selectedWarehouse.id, data: payload },
          { onSuccess: () => handleCloseWarehouseModal() }
        );
      } else {
        createWarehouseMutation.mutate(payload, {
          onSuccess: (res) => {
            handleCloseWarehouseModal();
            if (res.data) setSelectedWarehouseId(res.data.id);
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleDeleteWarehouse = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteWarehouseMutation.mutate(id, {
      onSuccess: () => {
        if (selectedWarehouseId === id) {
          setSelectedWarehouseId(null);
        }
      }
    });
  };
  
  // Location Handlers
  const handleOpenCreateLocation = (parent: LocationNodeResponse | null) => {
    setSelectedLocation(null);
    setLocationParentNode(parent);
    locationForm.resetFields();
    locationForm.setFieldsValue({
      warehouseId: selectedWarehouseId,
      parentId: parent?.id || undefined
    });
    setIsLocationModalOpen(true);
  };
  
  const handleOpenEditLocation = (node: LocationNodeResponse) => {
    setSelectedLocation(node);
    setLocationParentNode(null);
    locationForm.resetFields();
    locationForm.setFieldsValue({
      code: node.code,
      name: node.name,
      warehouseId: selectedWarehouseId,
      parentId: node.parentId || undefined,
      type: node.type,
      description: node.description,
      isActive: node.isActive
    });
    setIsLocationModalOpen(true);
  };
  
  const handleCloseLocationModal = () => {
    setIsLocationModalOpen(false);
    setSelectedLocation(null);
    setLocationParentNode(null);
    locationForm.resetFields();
  };
  
  const handleLocationSubmit = async () => {
    try {
      const values = await locationForm.validateFields();
      const payload: LocationRequest = {
        code: values.code,
        name: values.name,
        warehouseId: selectedWarehouseId!,
        parentId: values.parentId || null,
        type: values.type,
        description: values.description,
        isActive: selectedLocation ? values.isActive : true
      };
      
      if (selectedLocation) {
        updateLocationMutation.mutate(
          { id: selectedLocation.id, data: payload },
          { onSuccess: () => handleCloseLocationModal() }
        );
      } else {
        createLocationMutation.mutate(payload, {
          onSuccess: () => handleCloseLocationModal()
        });
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  // Format Tree Nodes for Antd Tree
  const formatTreeData = (nodes: LocationNodeResponse[]): any[] => {
    return nodes.map(node => ({
      key: node.id,
      title: (
        <div className="flex items-center justify-between group py-1 pr-4" style={{ minWidth: 260 }}>
          <span className="flex items-center gap-2">
            <EnvironmentOutlined className="text-blue-500" />
            <span className="font-semibold text-gray-800">{node.code}</span>
            <span className="text-gray-500 text-xs">({node.name})</span>
            <Tag color="cyan" style={{ borderRadius: 4, fontSize: '10px' }}>
              {node.type}
            </Tag>
            {!node.isActive && <Tag color="error">Ngừng</Tag>}
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-4">
            <Space size="small">
              {hasPermission('POST:/api/locations') && (
                <Tooltip title="Thêm vị trí con">
                  <Button 
                    type="text" 
                    size="small"
                    icon={<PlusOutlined style={{ color: '#52c41a' }} />} 
                    onClick={(e) => { e.stopPropagation(); handleOpenCreateLocation(node); }}
                  />
                </Tooltip>
              )}
              {hasPermission('PUT:/api/locations/{id}') && (
                <Tooltip title="Chỉnh sửa">
                  <Button 
                    type="text" 
                    size="small"
                    icon={<EditOutlined style={{ color: '#1677ff' }} />} 
                    onClick={(e) => { e.stopPropagation(); handleOpenEditLocation(node); }}
                  />
                </Tooltip>
              )}
              {node.isActive && hasPermission('DELETE:/api/locations/{id}') && (
                <Popconfirm
                  title="Xóa vị trí này và tất cả nhánh con?"
                  okText="Đồng ý"
                  cancelText="Hủy"
                  onConfirm={() => deleteLocationMutation.mutate(node.id)}
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
      children: node.children && node.children.length > 0 ? formatTreeData(node.children) : []
    }));
  };

  const formattedTree = treeData ? formatTreeData(treeData) : [];
  const selectedWarehouseData = warehousesData?.content?.find(w => w.id === selectedWarehouseId);

  const canWriteWarehouse = hasPermission('POST:/api/warehouses');
  const canEditWarehouse = hasPermission('PUT:/api/warehouses/{id}');
  const canDeleteWarehouse = hasPermission('DELETE:/api/warehouses/{id}');

  return (
    <PageContainer title="Quản lý Kho bãi & Sơ đồ Vị trí">
      <Row gutter={16}>
        {/* Left Column: Warehouse List */}
        <Col xs={24} md={8}>
          <Card 
            title={
              <Space>
                <HomeOutlined />
                <span>Danh sách kho hàng</span>
              </Space>
            }
            extra={
              canWriteWarehouse && (
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<PlusOutlined />} 
                  onClick={handleOpenCreateWarehouse}
                  style={{ borderRadius: 6 }}
                >
                  Thêm kho
                </Button>
              )
            }
            className="shadow-xs rounded-xl"
            bodyStyle={{ padding: 0 }}
          >
            <List
              loading={isWarehousesLoading}
              dataSource={warehousesData?.content || []}
              renderItem={(w) => (
                <List.Item
                  onClick={() => setSelectedWarehouseId(w.id)}
                  className={`cursor-pointer px-4 py-3 hover:bg-blue-50/50 transition-colors border-b border-gray-100 last:border-b-0 ${selectedWarehouseId === w.id ? 'bg-blue-50 border-r-4 border-r-blue-500 font-semibold' : ''}`}
                >
                  <div className="w-full flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-medium">{w.name}</span>
                        <Tag color={w.isActive ? 'success' : 'error'} style={{ borderRadius: 4 }}>
                          {w.code}
                        </Tag>
                      </div>
                      <div className="text-gray-500 text-xs truncate max-w-[200px]">{w.address || 'Chưa cập nhật địa chỉ'}</div>
                    </div>
                    <Space size="small">
                      {canEditWarehouse && (
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<EditOutlined style={{ color: '#1677ff' }} />} 
                          onClick={(e) => handleOpenEditWarehouse(w, e)}
                        />
                      )}
                      {w.isActive && canDeleteWarehouse && (
                        <Popconfirm
                          title="Vô hiệu hóa kho hàng này?"
                          okText="Đồng ý"
                          cancelText="Hủy"
                          onConfirm={(e) => { e?.stopPropagation(); handleDeleteWarehouse(w.id, e as any); }}
                          onCancel={(e) => e?.stopPropagation()}
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
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: <Empty description="Chưa có kho hàng nào." className="py-8" /> }}
            />
          </Card>
        </Col>

        {/* Right Column: Locations Tree */}
        <Col xs={24} md={16}>
          {selectedWarehouseId ? (
            <Card
              title={
                <div className="flex justify-between items-center w-full">
                  <Space>
                    <ClusterOutlined />
                    <span>Sơ đồ vị trí: <strong className="text-blue-600">{selectedWarehouseData?.name}</strong></span>
                  </Space>
                  {hasPermission('POST:/api/locations') && (
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => handleOpenCreateLocation(null)}
                      style={{ borderRadius: 6 }}
                    >
                      Thêm phân khu (Zone)
                    </Button>
                  )}
                </div>
              }
              className="shadow-xs rounded-xl min-h-[400px]"
            >
              {isTreeLoading ? (
                <div className="text-center py-8 text-gray-500">Đang tải sơ đồ vị trí...</div>
              ) : formattedTree.length > 0 ? (
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 overflow-auto max-h-[500px]">
                  <Tree
                    showLine={{ showLeafIcon: false }}
                    showIcon={false}
                    selectable={false}
                    defaultExpandAll
                    treeData={formattedTree}
                  />
                </div>
              ) : (
                <Empty 
                  description="Kho hàng này chưa được phân chia vị trí." 
                  className="py-12"
                >
                  {hasPermission('POST:/api/locations') && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenCreateLocation(null)}>
                      Phân chia vị trí ngay
                    </Button>
                  )}
                </Empty>
              )}
            </Card>
          ) : (
            <Card className="shadow-xs rounded-xl flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-400 py-12">
                <EnvironmentOutlined style={{ fontSize: 48 }} className="mb-4 text-gray-300 block" />
                <span>Vui lòng chọn một kho hàng ở danh sách bên trái để xem sơ đồ vị trí chi tiết.</span>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* Warehouse Modal */}
      <FormModal
        title={selectedWarehouse ? "Cập nhật Kho hàng" : "Thêm mới Kho hàng"}
        open={isWarehouseModalOpen}
        onClose={handleCloseWarehouseModal}
        onSubmit={handleWarehouseSubmit}
        isLoading={createWarehouseMutation.isPending || updateWarehouseMutation.isPending}
      >
        <Form form={warehouseForm} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label="Mã kho"
              rules={[
                { required: true, message: 'Mã kho không được để trống' },
                { max: 50, message: 'Không vượt quá 50 ký tự' }
              ]}
            >
              <Input placeholder="E.g. WH-HCM" disabled={!!selectedWarehouse} />
            </Form.Item>
            
            <Form.Item
              name="name"
              label="Tên kho"
              rules={[
                { required: true, message: 'Tên kho không được để trống' },
                { max: 200, message: 'Không vượt quá 200 ký tự' }
              ]}
            >
              <Input placeholder="Kho Trung tâm TP.HCM" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ max: 500, message: 'Không vượt quá 500 ký tự' }]}
          >
            <Input.TextArea rows={2} placeholder="Số 10, Đường Song Hành, Quận 12, TP.HCM" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ max: 500, message: 'Không vượt quá 500 ký tự' }]}
          >
            <Input.TextArea rows={2} placeholder="Kho phân phối sản phẩm chính khu vực miền Nam" />
          </Form.Item>
        </Form>
      </FormModal>

      {/* Location Modal */}
      <FormModal
        title={
          selectedLocation 
            ? "Cập nhật vị trí" 
            : `Thêm vị trí mới${locationParentNode ? ` (Con của ${locationParentNode.code})` : ' (Phân khu gốc)'}`
        }
        open={isLocationModalOpen}
        onClose={handleCloseLocationModal}
        onSubmit={handleLocationSubmit}
        isLoading={createLocationMutation.isPending || updateLocationMutation.isPending}
      >
        <Form form={locationForm} layout="vertical">
          <Form.Item name="warehouseId" noStyle><Input type="hidden" /></Form.Item>
          <Form.Item name="parentId" noStyle><Input type="hidden" /></Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label="Mã vị trí"
              rules={[
                { required: true, message: 'Mã vị trí không được để trống' },
                { max: 50, message: 'Không vượt quá 50 ký tự' }
              ]}
            >
              <Input placeholder="E.g. ZONE-A, AISLE-1, SHELF-B2" disabled={!!selectedLocation} />
            </Form.Item>
            
            <Form.Item
              name="name"
              label="Tên vị trí"
              rules={[
                { required: true, message: 'Tên vị trí không được để trống' },
                { max: 200, message: 'Không vượt quá 200 ký tự' }
              ]}
            >
              <Input placeholder="Khu vực lưu trữ hàng khô" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="type"
            label="Loại vị trí"
            rules={[{ required: true, message: 'Vui lòng chọn loại vị trí' }]}
          >
            <Select placeholder="Chọn loại vị trí...">
              <Select.Option value="ZONE">Khu (Zone)</Select.Option>
              <Select.Option value="AISLE">Lối đi / Dãy (Aisle)</Select.Option>
              <Select.Option value="SHELF">Ô kệ (Shelf)</Select.Option>
              <Select.Option value="RACK">Khung đỡ / Giá kệ (Rack)</Select.Option>
              <Select.Option value="BIN">Hộc chứa / Thùng (Bin)</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ max: 500, message: 'Không vượt quá 500 ký tự' }]}
          >
            <Input.TextArea rows={2} placeholder="Mô tả chi tiết hoặc vị trí chỉ dẫn..." />
          </Form.Item>
        </Form>
      </FormModal>
    </PageContainer>
  );
};

export default WarehouseListPage;
