import { useEffect } from 'react';
import { Card, Form, Input, Select, InputNumber, Button, Spin, Row, Col, Alert, message } from 'antd';
import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { useSystemSettings, useUpdateSystemSetting } from '../hooks/useSystemSettings';

export const SystemSettingsPage = () => {
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useSystemSettings();
  const updateSettingMutation = useUpdateSystemSetting();

  useEffect(() => {
    if (settings) {
      const formValues: Record<string, any> = {};
      settings.forEach(item => {
        if (item.settingKey === 'LOW_STOCK_THRESHOLD' || item.settingKey === 'ALERT_EXPIRY_DAYS') {
          formValues[item.settingKey] = Number(item.settingVal);
        } else {
          formValues[item.settingKey] = item.settingVal;
        }
      });
      form.setFieldsValue(formValues);
    }
  }, [settings, form]);

  const handleFinish = async (values: any) => {
    try {
      const promises = Object.keys(values).map(key => {
        const rawValue = String(values[key]);
        const originalVal = settings?.find(s => s.settingKey === key)?.settingVal;
        // Only update if value changed
        if (rawValue !== originalVal) {
          return updateSettingMutation.mutateAsync({ key, data: { settingVal: rawValue } });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      message.success('Đã lưu tất cả cấu hình hệ thống thành công');
    } catch (err) {
      console.error(err);
      message.error('Có lỗi xảy ra khi cập nhật cấu hình');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Đang tải cấu hình..." />
      </div>
    );
  }

  return (
    <PageContainer title="Cấu hình hệ thống">
      <div className="max-w-4xl mx-auto space-y-4">
        <Alert
          message="Cảnh báo an toàn"
          description="Các cấu hình này ảnh hưởng trực tiếp đến logic hoạt động cốt lõi của kho hàng (chiến lược xuất kho, ngưỡng tính toán tồn tối thiểu). Chỉ quản trị viên hệ thống mới nên sửa đổi các cấu hình này."
          type="warning"
          showIcon
          className="mb-4"
        />

        <Card bordered={false} className="shadow-sm rounded-xl" title={
          <div className="flex items-center gap-2">
            <SettingOutlined className="text-blue-500" />
            <span>Cài đặt tham số vận hành</span>
          </div>
        }>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            requiredMark="optional"
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Chiến lược xuất hàng đề xuất"
                  name="OUTBOUND_STRATEGY"
                  tooltip="Quyết định thứ tự xuất lô hàng tự động đề xuất trong phiếu xuất (FIFO: Nhập trước xuất trước, FEFO: Hạn dùng trước xuất trước)"
                  rules={[{ required: true, message: 'Vui lòng chọn chiến lược' }]}
                >
                  <Select style={{ borderRadius: 8 }}>
                    <Select.Option value="FEFO">FEFO (Hạn dùng trước xuất trước - Khuyên dùng)</Select.Option>
                    <Select.Option value="FIFO">FIFO (Nhập trước xuất trước)</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Đơn vị tiền tệ chính"
                  name="CURRENCY"
                  rules={[{ required: true, message: 'Không được bỏ trống' }]}
                >
                  <Input placeholder="VND" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Ngưỡng cảnh báo tồn kho thấp (Global)"
                  name="LOW_STOCK_THRESHOLD"
                  tooltip="Số lượng tồn tối thiểu chung cho tất cả sản phẩm để kích hoạt cảnh báo tồn thấp nếu sản phẩm không có cấu hình tồn tối thiểu riêng"
                  rules={[{ required: true, message: 'Vui lòng nhập ngưỡng tồn tối thiểu' }]}
                >
                  <InputNumber min={0} className="w-full" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Số ngày cảnh báo hạn sử dụng sắp hết"
                  name="ALERT_EXPIRY_DAYS"
                  tooltip="Số ngày đếm ngược trước khi hết hạn sử dụng của lô hàng để phát tín hiệu cảnh báo khẩn cấp"
                  rules={[{ required: true, message: 'Vui lòng nhập số ngày' }]}
                >
                  <InputNumber min={1} className="w-full" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Định dạng hiển thị ngày giờ"
              name="DATE_FORMAT"
              rules={[{ required: true, message: 'Vui lòng nhập định dạng' }]}
            >
              <Select style={{ borderRadius: 8 }}>
                <Select.Option value="yyyy-MM-dd HH:mm:ss">YYYY-MM-DD HH:mm:ss (Tiêu chuẩn)</Select.Option>
                <Select.Option value="dd/MM/yyyy HH:mm:ss">DD/MM/YYYY HH:mm:ss (Việt Nam)</Select.Option>
              </Select>
            </Form.Item>

            <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={updateSettingMutation.isPending}
                style={{ borderRadius: 8, height: 40 }}
              >
                Lưu cấu hình
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </PageContainer>
  );
};

export default SystemSettingsPage;
