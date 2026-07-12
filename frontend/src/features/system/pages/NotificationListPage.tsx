import { useState } from 'react';
import { Card, List, Button, Tag, Space, Typography, Radio, message } from 'antd';
import { CheckOutlined, BellOutlined } from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { 
  useNotifications, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead 
} from '../hooks/useNotifications';

const { Text } = Typography;

export const NotificationListPage = () => {
  const [filterRead, setFilterRead] = useState<'ALL' | 'UNREAD'>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const isReadFilter = filterRead === 'UNREAD' ? false : undefined;
  const { data, isLoading } = useNotifications({
    page: page - 1,
    size: pageSize,
    isRead: isReadFilter
  });

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate(undefined, {
      onSuccess: () => {
        message.success('Đã đánh dấu tất cả thông báo là đã đọc');
      }
    });
  };

  const handleMarkRead = (id: number) => {
    markReadMutation.mutate(id);
  };

  const getNotifTagColor = (type: string) => {
    switch (type) {
      case 'WARNING': return 'warning';
      case 'SUCCESS': return 'success';
      case 'ERROR': return 'error';
      default: return 'info';
    }
  };

  return (
    <PageContainer title="Thông báo hệ thống">
      <div className="space-y-4">
        <Card bordered={false} className="shadow-sm rounded-xl">
          <div className="flex flex-wrap gap-4 justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
            <Radio.Group 
              value={filterRead} 
              onChange={(e) => {
                setFilterRead(e.target.value);
                setPage(1);
              }}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="ALL">Tất cả thông báo</Radio.Button>
              <Radio.Button value="UNREAD">Chưa đọc</Radio.Button>
            </Radio.Group>

            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              onClick={handleMarkAllRead}
              disabled={!data || data.totalElements === 0}
              style={{ borderRadius: 8 }}
            >
              Đánh dấu đọc tất cả
            </Button>
          </div>

          <List
            loading={isLoading}
            itemLayout="horizontal"
            dataSource={data?.content || []}
            locale={{ emptyText: 'Không tìm thấy thông báo nào.' }}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: data?.totalElements || 0,
              onChange: (p) => setPage(p),
              showSizeChanger: false,
              style: { marginTop: 24, textAlign: 'right' }
            }}
            renderItem={(item) => (
              <List.Item
                style={{ 
                  padding: '16px 24px', 
                  borderBottom: '1px solid #f0f0f0',
                  background: !item.isRead ? '#f6f9fe' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
                actions={[
                  !item.isRead && (
                    <Button 
                      key="read" 
                      type="text" 
                      icon={<CheckOutlined />} 
                      onClick={() => handleMarkRead(item.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Đánh dấu đã đọc
                    </Button>
                  )
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        !item.isRead ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <BellOutlined style={{ fontSize: '18px' }} />
                    </div>
                  }
                  title={
                    <Space size="middle" align="center">
                      <span className={`font-semibold ${!item.isRead ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                        {item.title}
                      </span>
                      <Tag color={getNotifTagColor(item.type)} style={{ borderRadius: 4 }}>
                        {item.type}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div className="flex flex-col gap-1 mt-1">
                      <Text type="secondary" className="text-gray-600">
                        {item.content}
                      </Text>
                      <span className="text-[11px] text-gray-400">
                        Người gửi: {item.createdBy || 'Hệ thống'} | Lúc: {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </PageContainer>
  );
};

export default NotificationListPage;
