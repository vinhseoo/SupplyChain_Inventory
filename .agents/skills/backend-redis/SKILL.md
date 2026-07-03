---
name: backend-redis
description: Skill để sử dụng Redis trong backend SCIM. Bao gồm caching, distributed lock, và real-time counter patterns.
---

# Backend Redis — Caching, Lock & Counter

## 1. Caching Pattern

### Spring Cache annotations
```java
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    @Cacheable(value = "products", key = "#id")
    public ProductResponse getById(Long id) {
        // Query DB only if not in cache
    }

    @CacheEvict(value = "products", key = "#id")
    public ProductResponse update(Long id, ProductRequest request) {
        // Evict cache after update
    }

    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse create(ProductRequest request) {
        // Evict all cache entries after create
    }
}
```

### Redis Configuration
```java
@Configuration
@EnableCaching
public class RedisConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .withCacheConfiguration("products",
                        config.entryTtl(Duration.ofMinutes(60)))
                .withCacheConfiguration("suppliers",
                        config.entryTtl(Duration.ofMinutes(60)))
                .build();
    }
}
```

## 2. Distributed Lock Pattern (cho xuất kho)

```java
@Component
@RequiredArgsConstructor
public class RedisLockUtils {

    private final StringRedisTemplate redisTemplate;

    public boolean acquireLock(String key, String value, long timeoutMs) {
        Boolean success = redisTemplate.opsForValue()
                .setIfAbsent(key, value, Duration.ofMillis(timeoutMs));
        return Boolean.TRUE.equals(success);
    }

    public void releaseLock(String key, String value) {
        String currentValue = redisTemplate.opsForValue().get(key);
        if (value.equals(currentValue)) {
            redisTemplate.delete(key);
        }
    }
}
```

Usage khi xuất kho:
```java
String lockKey = "stock:lock:" + productId + ":" + warehouseId;
String lockValue = UUID.randomUUID().toString();

if (!redisLockUtils.acquireLock(lockKey, lockValue, 5000)) {
    throw new BusinessException("Stock is being modified by another transaction. Please try again.");
}
try {
    // Thực hiện xuất kho
} finally {
    redisLockUtils.releaseLock(lockKey, lockValue);
}
```

## 3. Real-time Counter Pattern

```java
// Increment stock counter
redisTemplate.opsForHash().increment("stock:counter", productId + ":" + warehouseId, quantity);

// Get current stock from Redis
String count = (String) redisTemplate.opsForHash().get("stock:counter", productId + ":" + warehouseId);
```

## Rules
- TTL bắt buộc cho tất cả cache entries
- Master data (products, suppliers): TTL 30-60 phút
- Transaction data: KHÔNG cache (hoặc TTL rất ngắn)
- Distributed Lock timeout: 5-10 giây
- Luôn release lock trong `finally` block
- Sync Redis counter với DB định kỳ (scheduled task)
