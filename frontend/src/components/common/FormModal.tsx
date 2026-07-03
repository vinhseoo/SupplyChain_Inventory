import type { ReactNode } from 'react';
import { Modal } from 'antd';
import type { ModalProps } from 'antd';

interface FormModalProps extends Omit<ModalProps, 'onOk'> {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  children: ReactNode;
}

export const FormModal = ({
  title,
  open,
  onClose,
  onSubmit,
  isLoading = false,
  children,
  width = 600,
  ...props
}: FormModalProps) => {
  return (
    <Modal
      title={<span className="text-lg font-semibold text-gray-900">{title}</span>}
      open={open}
      onCancel={onClose}
      onOk={onSubmit}
      confirmLoading={isLoading}
      width={width}
      destroyOnClose
      maskClosable={false}
      className="rounded-xl overflow-hidden"
      okText="Lưu lại"
      cancelText="Hủy bỏ"
      {...props}
    >
      <div className="py-4">{children}</div>
    </Modal>
  );
};
