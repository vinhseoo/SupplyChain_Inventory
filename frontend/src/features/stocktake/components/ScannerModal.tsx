import { useEffect, useRef } from 'react';
import { Modal, Button, Alert } from 'antd';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const ScannerModal = ({ visible, onClose, onScanSuccess }: ScannerModalProps) => {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const regionId = 'qr-reader';

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        const html5QrCode = new Html5Qrcode(regionId);
        html5QrCodeRef.current = html5QrCode;

        html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            html5QrCode.stop().then(() => {
              onScanSuccess(decodedText);
              onClose();
            }).catch(err => {
              console.error('Failed to stop camera scan', err);
              onScanSuccess(decodedText);
              onClose();
            });
          },
          () => {
            // Silence scanning errors
          }
        ).catch((err) => {
          console.error('Failed to start QR camera scanning', err);
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(err => console.error('Failed to stop scanning in cleanup', err));
        }
      };
    }
  }, [visible, onClose, onScanSuccess]);

  return (
    <Modal
      title="Quét mã QR / Barcode sản phẩm"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
      destroyOnClose
      width={400}
      styles={{ body: { padding: '20px 10px' } }}
    >
      <div className="space-y-4">
        <Alert
          message="Hướng dẫn"
          description="Đưa camera về phía mã QR Code của lô hàng (dạng SCIM:BATCH:...) hoặc mã vạch/SKU để tự động quét nhận dạng."
          type="info"
          showIcon
          className="mb-4"
        />
        <div 
          id={regionId} 
          style={{ 
            width: '100%', 
            maxWidth: '350px', 
            margin: '0 auto', 
            borderRadius: '12px', 
            overflow: 'hidden',
            border: '2px solid #1890ff'
          }}
        />
      </div>
    </Modal>
  );
};
