package com.scim.event;

import com.scim.entity.InventoryTransaction;
import com.scim.entity.NotificationType;
import com.scim.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TransactionEventListener {

    private final NotificationService notificationService;

    @EventListener
    public void handleTransactionStatusChange(TransactionStatusEvent event) {
        InventoryTransaction tx = event.getTransaction();
        log.info("Received transaction status change event for tx: {}, status: {}", tx.getCode(), tx.getStatus());

        try {
            switch (tx.getStatus()) {
                case PENDING -> notificationService.create(
                        null, // Broadcast to all users
                        "Yêu cầu duyệt phiếu kho",
                        String.format("Phiếu kho %s (%s) đang ở trạng thái chờ duyệt.", tx.getCode(), tx.getType()),
                        NotificationType.WARNING
                );
                case APPROVED -> notificationService.create(
                        null,
                        "Phiếu kho đã duyệt",
                        String.format("Phiếu kho %s (%s) đã được duyệt thành công.", tx.getCode(), tx.getType()),
                        NotificationType.SUCCESS
                );
                case COMPLETED -> notificationService.create(
                        null,
                        "Phiếu kho hoàn tất",
                        String.format("Phiếu kho %s (%s) đã được hoàn tất nhập/xuất kho.", tx.getCode(), tx.getType()),
                        NotificationType.SUCCESS
                );
                case CANCELLED -> notificationService.create(
                        null,
                        "Phiếu kho đã hủy",
                        String.format("Phiếu kho %s (%s) đã bị hủy bỏ.", tx.getCode(), tx.getType()),
                        NotificationType.ERROR
                );
            }
        } catch (Exception e) {
            log.error("Failed to generate notification for transaction event: {}", e.getMessage(), e);
        }
    }
}
