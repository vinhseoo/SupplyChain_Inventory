import { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  Space, 
  Card, 
  InputNumber, 
  Row, 
  Col, 
  message, 
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined, 
  SaveOutlined,
  SendOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { 
  useCreateTransaction, 
  useUpdateTransaction, 
  useTransaction,
  useSubmitTransaction
} from '../hooks/useTransactions';
import { useProducts } from '@/features/product/hooks/useProducts';
import { useSuppliers } from '@/features/supplier/hooks/useSuppliers';
import { useWarehouses } from '@/features/warehouse/hooks/useWarehouses';
import { locationService } from '@/services/locationService';
import { transactionService } from '@/services/transactionService';
import type { LocationResponse, InventoryTransactionRequest } from '@/types';
import dayjs from 'dayjs';



export const TransactionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [form] = Form.useForm();
  const txType = Form.useWatch('type', form);
  const srcWarehouseId = Form.useWatch('sourceWarehouseId', form);
  const destWarehouseId = Form.useWatch('destinationWarehouseId', form);

  // States for locations
  const [srcLocations, setSrcLocations] = useState<LocationResponse[]>([]);
  const [destLocations, setDestLocations] = useState<LocationResponse[]>([]);

  // Fetch Master Data
  const { data: productsData } = useProducts({ page: 0, size: 100 });
  const { data: suppliersData } = useSuppliers({ page: 0, size: 100 });
  const { data: warehousesData } = useWarehouses({ page: 0, size: 100 });

  const { data: existingTx } = useTransaction(id ? parseInt(id) : undefined);

  // Mutations
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const submitMutation = useSubmitTransaction();

  // Load locations for source warehouse
  useEffect(() => {
    if (srcWarehouseId) {
      locationService.getByWarehouse(srcWarehouseId)
        .then(res => setSrcLocations(res.data))
        .catch(() => message.error('Không thể lấy vị trí kho nguồn'));
    } else {
      setSrcLocations([]);
    }
  }, [srcWarehouseId]);

  // Load locations for dest warehouse
  useEffect(() => {
    if (destWarehouseId) {
      locationService.getByWarehouse(destWarehouseId)
        .then(res => setDestLocations(res.data))
        .catch(() => message.error('Không thể lấy vị trí kho nhập'));
    } else {
      setDestLocations([]);
    }
  }, [destWarehouseId]);

  // Load existing transaction for edit
  useEffect(() => {
    if (isEdit && existingTx) {
      form.setFieldsValue({
        code: existingTx.code,
        type: existingTx.type,
        sourceWarehouseId: existingTx.sourceWarehouseId,
        destinationWarehouseId: existingTx.destinationWarehouseId,
        supplierId: existingTx.supplierId,
        transactionDate: dayjs(existingTx.transactionDate),
        note: existingTx.note,
        items: existingTx.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          sourceLocationId: item.sourceLocationId,
          destinationLocationId: item.destinationLocationId,
          batchNumber: item.batchNumber,
          productionDate: item.productionDate ? dayjs(item.productionDate) : null,
          expiryDate: item.expiryDate ? dayjs(item.expiryDate) : null,
          note: item.note
        }))
      });
    } else if (!isEdit) {
      form.resetFields();
      form.setFieldsValue({
        code: 'TX-' + dayjs().format('YYYYMMDD-HHmmss'),
        transactionDate: dayjs(),
        items: [{}]
      });
    }
  }, [isEdit, existingTx, form]);

  const handleProductChange = (productId: number, index: number) => {
    const selectedProd = productsData?.content.find(p => p.id === productId);
    if (selectedProd) {
      const items = form.getFieldValue('items');
      items[index] = {
        ...items[index],
        price: selectedProd.price,
      };
      form.setFieldsValue({ items });
    }
  };

  const handleSuggest = async (index: number) => {
    const items = form.getFieldValue('items');
    const row = items[index];
    const productId = row.productId;
    const warehouseId = srcWarehouseId;
    const qty = row.quantity;

    if (!productId || !warehouseId || !qty) {
      message.warning('Vui lòng chọn Sản phẩm, Kho xuất và Số lượng trước khi lấy gợi ý');
      return;
    }

    try {
      const res = await transactionService.suggestOutbound(productId, warehouseId, qty, 'FEFO');
      const suggestions = res.data;

      if (suggestions.length === 0) {
        message.info('Không có tồn kho khả dụng cho sản phẩm này.');
        return;
      }

      // Replace the current row with the first suggestion
      const first = suggestions[0];
      items[index] = {
        ...row,
        sourceLocationId: first.locationId,
        batchNumber: first.batchNumber,
        quantity: first.quantity,
        expiryDate: first.expiryDate ? dayjs(first.expiryDate) : null
      };

      // Append remaining suggestions as new rows
      if (suggestions.length > 1) {
        for (let i = 1; i < suggestions.length; i++) {
          const sug = suggestions[i];
          items.push({
            productId,
            price: row.price,
            sourceLocationId: sug.locationId,
            batchNumber: sug.batchNumber,
            quantity: sug.quantity,
            expiryDate: sug.expiryDate ? dayjs(sug.expiryDate) : null
          });
        }
      }

      form.setFieldsValue({ items });
      message.success('Đã áp dụng gợi ý vị trí & lô tối ưu theo FEFO.');
    } catch (error) {
      message.error('Lỗi khi lấy gợi ý xuất kho');
    }
  };

  const onFinish = async (values: any, shouldSubmit = false) => {
    try {
      const payload: InventoryTransactionRequest = {
        code: values.code,
        type: values.type,
        sourceWarehouseId: values.sourceWarehouseId,
        destinationWarehouseId: values.destinationWarehouseId,
        supplierId: values.supplierId,
        transactionDate: values.transactionDate ? values.transactionDate.toISOString() : undefined,
        note: values.note,
        items: values.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          sourceLocationId: item.sourceLocationId,
          destinationLocationId: item.destinationLocationId,
          batchNumber: item.batchNumber,
          productionDate: item.productionDate ? item.productionDate.format('YYYY-MM-DD') : undefined,
          expiryDate: item.expiryDate ? item.expiryDate.format('YYYY-MM-DD') : undefined,
          note: item.note
        }))
      };

      if (isEdit) {
        const txId = parseInt(id);
        updateMutation.mutate({ id: txId, data: payload }, {
          onSuccess: (res) => {
            if (shouldSubmit) {
              submitMutation.mutate(res.data.id, {
                onSuccess: () => navigate('/inventory/transactions')
              });
            } else {
              navigate('/inventory/transactions');
            }
          }
        });
      } else {
        createMutation.mutate(payload, {
          onSuccess: (res) => {
            if (shouldSubmit) {
              submitMutation.mutate(res.data.id, {
                onSuccess: () => navigate('/inventory/transactions')
              });
            } else {
              navigate('/inventory/transactions');
            }
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PageContainer title={isEdit ? "Cập nhật phiếu kho" : "Lập phiếu kho mới"}>
      <Card bordered={false} className="shadow-xs rounded-xl">
        <Space className="mb-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/inventory/transactions')}>
            Quay lại danh sách
          </Button>
        </Space>
        
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={(val) => onFinish(val, false)}
          initialValues={{ items: [{}] }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Form.Item
              name="code"
              label="Mã phiếu"
              rules={[{ required: true, message: 'Nhập mã phiếu' }]}
            >
              <Input placeholder="E.g. TX-XXXXXXXX" disabled={isEdit} />
            </Form.Item>

            <Form.Item
              name="type"
              label="Loại giao dịch"
              rules={[{ required: true, message: 'Chọn loại giao dịch' }]}
            >
              <Select placeholder="Chọn loại" disabled={isEdit}>
                <Select.Option value="INBOUND">Nhập kho (Inbound)</Select.Option>
                <Select.Option value="OUTBOUND">Xuất kho (Outbound)</Select.Option>
                <Select.Option value="TRANSFER">Chuyển kho</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="transactionDate"
              label="Ngày thực hiện"
              rules={[{ required: true, message: 'Chọn ngày thực hiện' }]}
            >
              <DatePicker className="w-full" showTime format="DD/MM/YYYY HH:mm" />
            </Form.Item>

            {txType === 'INBOUND' && (
              <Form.Item name="supplierId" label="Nhà cung cấp">
                <Select placeholder="Chọn nhà cung cấp" allowClear>
                  {suppliersData?.content.map(s => (
                    <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(txType === 'OUTBOUND' || txType === 'TRANSFER') && (
              <Form.Item
                name="sourceWarehouseId"
                label="Kho xuất"
                rules={[{ required: true, message: 'Chọn kho xuất' }]}
              >
                <Select placeholder="Chọn kho nguồn" allowClear>
                  {warehousesData?.content.map(w => (
                    <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {(txType === 'INBOUND' || txType === 'TRANSFER') && (
              <Form.Item
                name="destinationWarehouseId"
                label="Kho nhập"
                rules={[{ required: true, message: 'Chọn kho nhập' }]}
              >
                <Select placeholder="Chọn kho đích" allowClear>
                  {warehousesData?.content.map(w => (
                    <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </div>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Nhập ghi chú giao dịch..." />
          </Form.Item>

          <Divider orientation="left">Danh sách hàng hóa</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card 
                    key={key} 
                    size="small" 
                    className="bg-gray-50/30 border border-gray-100 rounded-xl relative shadow-2xs hover:shadow-xs transition-shadow"
                    extra={
                      fields.length > 1 && (
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={() => remove(name)}
                        />
                      )
                    }
                    title={`Hàng hóa #${index + 1}`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Form.Item
                        {...restField}
                        name={[name, 'productId']}
                        label="Sản phẩm"
                        rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                      >
                        <Select
                          showSearch
                          placeholder="Chọn sản phẩm"
                          optionFilterProp="children"
                          onChange={(val) => handleProductChange(val, index)}
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={productsData?.content.map(p => ({
                            value: p.id,
                            label: `${p.name} (${p.sku})`
                          }))}
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        label="Số lượng"
                        rules={[{ required: true, message: 'Nhập số lượng' }]}
                      >
                        <InputNumber min={0.0001} className="w-full" placeholder="0.00" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'price']}
                        label="Đơn giá"
                        rules={[{ required: true, message: 'Nhập đơn giá' }]}
                      >
                        <InputNumber min={0} className="w-full" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => (value ? parseFloat(value.replace(/\$\s?|(,*)/g, '')) : 0) as any} placeholder="0" />
                      </Form.Item>

                      {/* Outbound Suggest Button */}
                      {txType === 'OUTBOUND' && (
                        <div className="flex items-end pb-6">
                          <Button 
                            type="dashed" 
                            icon={<BulbOutlined />} 
                            className="w-full"
                            onClick={() => handleSuggest(index)}
                          >
                            Gợi ý vị trí & lô
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Location fields based on transaction type */}
                      {(txType === 'OUTBOUND' || txType === 'TRANSFER') && (
                        <Form.Item
                          {...restField}
                          name={[name, 'sourceLocationId']}
                          label="Vị trí xuất"
                          rules={[{ required: true, message: 'Chọn vị trí xuất' }]}
                        >
                          <Select placeholder="Chọn vị trí nguồn" disabled={!srcWarehouseId}>
                            {srcLocations.map(loc => (
                              <Select.Option key={loc.id} value={loc.id}>{loc.name}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      )}

                      {(txType === 'INBOUND' || txType === 'TRANSFER') && (
                        <Form.Item
                          {...restField}
                          name={[name, 'destinationLocationId']}
                          label="Vị trí nhập"
                          rules={[{ required: true, message: 'Chọn vị trí nhập' }]}
                        >
                          <Select placeholder="Chọn vị trí đích" disabled={!destWarehouseId}>
                            {destLocations.map(loc => (
                              <Select.Option key={loc.id} value={loc.id}>{loc.name}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      )}

                      <Form.Item
                        {...restField}
                        name={[name, 'batchNumber']}
                        label="Số lô (Batch)"
                      >
                        <Input placeholder="E.g. BATCH-001" />
                      </Form.Item>

                      {txType === 'INBOUND' && (
                        <>
                          <Form.Item
                            {...restField}
                            name={[name, 'productionDate']}
                            label="Ngày sản xuất"
                          >
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'expiryDate']}
                            label="Hạn sử dụng"
                          >
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                          </Form.Item>
                        </>
                      )}

                      {txType !== 'INBOUND' && (
                        <Form.Item
                          {...restField}
                          name={[name, 'expiryDate']}
                          label="Hạn sử dụng"
                        >
                          <DatePicker className="w-full" format="DD/MM/YYYY" disabled />
                        </Form.Item>
                      )}
                    </div>
                  </Card>
                ))}
                
                <Button 
                  type="dashed" 
                  onClick={() => add()} 
                  block 
                  icon={<PlusOutlined />}
                  style={{ borderRadius: 8 }}
                >
                  Thêm hàng hóa
                </Button>
              </div>
            )}
          </Form.List>

          <Divider />

          <Row justify="end" gutter={16}>
            <Col>
              <Button 
                onClick={() => navigate('/inventory/transactions')}
                style={{ borderRadius: 8 }}
              >
                Hủy bỏ
              </Button>
            </Col>
            <Col>
              <Button 
                type="default" 
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={createMutation.isPending || updateMutation.isPending}
                style={{ borderRadius: 8 }}
              >
                Lưu nháp
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={() => {
                  form.validateFields().then(values => {
                    onFinish(values, true);
                  });
                }}
                loading={createMutation.isPending || updateMutation.isPending || submitMutation.isPending}
                style={{ borderRadius: 8 }}
              >
                Lưu & Gửi duyệt
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default TransactionFormPage;
