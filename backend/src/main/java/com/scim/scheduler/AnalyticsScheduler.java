package com.scim.scheduler;

import com.scim.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AnalyticsScheduler {

    private final AnalyticsService analyticsService;

    // Run daily at 2 AM
    @Scheduled(cron = "0 0 2 * * ?")
    public void scheduleDailyRefresh() {
        log.info("Daily scheduler triggered: Refreshing analytics materialized views...");
        analyticsService.refreshMaterializedViews();
    }

    // Run 20 seconds after startup, then every 24 hours to ensure local test data displays correctly
    @Scheduled(initialDelay = 20000, fixedDelay = 86400000)
    public void scheduleStartupRefresh() {
        log.info("Startup scheduler triggered: Refreshing analytics materialized views...");
        analyticsService.refreshMaterializedViews();
    }
}
