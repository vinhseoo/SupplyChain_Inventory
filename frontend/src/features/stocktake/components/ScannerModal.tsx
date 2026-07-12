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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const html5QrCode = html5QrCodeRef.current || new Html5Qrcode(regionId);
    
    // Stop scanning first if it's currently scanning
    const stopPromise = html5QrCode.isScanning 
      ? html5QrCode.stop() 
      : Promise.resolve();

    stopPromise.then(() => {
      html5QrCode.scanFile(file, false)
        .then((decodedText) => {
          onScanSuccess(decodedText);
          onClose();
        })
        .catch((err) => {
          console.error('Failed to parse QR from file', err);
          alert('Không thể nhận diện mã QR từ tệp tin hình ảnh này. Vui lòng chọn tệp tin hình ảnh chứa QR Code rõ ràng.');
        });
    }).catch(err => {
      console.error('Error stopping scanner for file parse', err);
    });
  };

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
        
        <div className="flex flex-col items-center pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400 mb-2">Hoặc quét từ tệp tin hình ảnh đã tải xuống:</span>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
            id="qr-file-input"
          />
          <Button 
            type="default" 
            onClick={() => document.getElementById('qr-file-input')?.click()}
            className="w-full"
          >
            Chọn ảnh QR Code từ thiết bị
          </Button>
        </div>
      </div>
    </Modal>
  );
};
