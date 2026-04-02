# 🔥 Các Kỹ Thuật Phân Mảnh Cơ Sở Dữ Liệu (Database Partitioning)

**Một hướng dẫn toàn diện về cách tối ưu hóa hiệu suất cơ sở dữ liệu quy mô lớn**

---

## 📊 Tổng Quan Quick Reference

| Kỹ Thuật | Chiến Lược | Phù Hợp Khi | Ưu Điểm | Nhược Điểm |
|---------|-----------|-----------|---------|-----------|
| **Horizontal** | Chia HÀNG theo tiêu chí | Dữ liệu lớn, truy vấn nặng | Giảm IO, cải thiện cache | Phức tạp JOIN |
| **Vertical** | Chia CỘT theo nhóm | Có cột nặng (BLOB, TEXT) | GC tốt, query nhanh | Nhiều bảng, JOIN nhiều |
| **Functional** | Chia theo chức năng | Kiến trúc microservices | Độc lập, scale riêng | Phức tạp distributed |
| **Directory-based** | Sử dụng bảng lookup | Tính linh hoạt cao | Thay đổi dễ dàng | Thêm query lookup |

---

## 1. 📤 Phân Mảnh Ngang (Horizontal Partitioning - Sharding)

### 🎯 Khái Niệm
Chia dữ liệu **theo hàng** (row) thành nhiều bảng/database dựa trên **một tiêu chí** (hash, range, list). Các mảnh có **schema giống nhau** nhưng chứa **từng slice dữ liệu riêng biệt**.

### 💡 Khi Nào Sử Dụng?
- ✅ Bảng có **> 10 triệu bản ghi** và tăng liên tục
- ✅ Truy vấn chủ yếu **lọc theo một field** cụ thể
- ✅ Cần **phân tán tải** giữa nhiều server
- ✅ Ví dụ: User lớn, Orders, Events, Logs

### 📝 Ví Dụ Thực Tế - Phân Mảnh User Theo Giới Tính

**Dữ liệu gốc:**
```
| id | name      | gender | age |
|----+-----------|--------|-----|
| 1  | An        | Nam    | 25  |
| 2  | Bình      | Nữ     | 22  |
| 3  | Chi       | Nữ     | 24  |
| 4  | Duy       | Nam    | 26  |
```

**Sau khi phân mảnh:**

**📦 table_user_nam (16 triệu bản ghi)**
```sql
| id | name | gender | age |
|----|------|--------|-----|
| 1  | An   | Nam    | 25  |
| 4  | Duy  | Nam    | 26  |
```

**📦 table_user_nu (14 triệu bản ghi)**
```sql
| id | name | gender | age |
|----|------|--------|-----|
| 2  | Bình | Nữ     | 22  |
| 3  | Chi  | Nữ     | 24  |
```

### 🗂️ Các Chiến Lược Phân Mảnh

#### **1.1 Range-based (Phân mảnh theo khoảng)**
```java
// Chia theo user_id (e.g., mỗi shard chứa 1 triệu user)
int shardId = (userId / 1_000_000) % NUM_SHARDS;

// Hoặc chia theo ngày
String shardKey = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
// → user_2024_01, user_2024_02, etc.
```

**Ưu điểm:** Dễ implement, dễ quản lý dữ liệu cũ  
**Nhược điểm:** Có thể không cân bằng tải (hotspot)

---

#### **1.2 Hash-based (Phân mảnh theo hash)**
```java
// Chia đều dữ liệu theo hash
public static int getShardId(long userId, int numShards) {
    return Math.abs(userId.hashCode()) % numShards;
}

// Hoặc sử dụng Consistent Hashing
consistentHash.getNode(userId).getShardId();
```

**Ưu điểm:** Cân bằng tải tốt, phân phối đều  
**Nhược điểm:** Khó query range, khó quản lý khi thêm shard

---

#### **1.3 List-based (Phân mảnh theo danh sách)**
```java
// Chia theo region
switch(user.getRegion()) {
    case "NORTH": return shardVietnamNorth;
    case "CENTRAL": return shardVietnamCentral;
    case "SOUTH": return shardVietnamSouth;
}
```

**Ưu điểm:** Rõ ràng, dễ sắp xếp  
**Nhược điểm:** Cần maintain mapping thủ công

---

#### **1.4 Directory-based (Phân mảnh động)**
```java
// Sử dụng bảng lookup để cartographic sharding
ShardMapping mapping = shardMappingRepository.find(userId);
// → { userId: 1001, shardId: 3, datacenter: "DC-HCM" }
```

**Ưu điểm:** Linh hoạt nhất, dễ thay đổi  
**Nhược điểm:** Overhead query lookup

---

### 💻 Triển Khai Spring Boot

```java
@Component
public class UserShardingService {
    
    @Qualifier("datasource1")
    private DataSource ds1;
    
    @Qualifier("datasource2")
    private DataSource ds2;
    
    // Xác định shard key
    public int getShardId(Long userId) {
        return Math.abs(userId.hashCode()) % 2;
    }
    
    // Lưu user vào shard đúng
    public void saveUser(User user) {
        int shardId = getShardId(user.getId());
        JdbcTemplate template = new JdbcTemplate(shardId == 0 ? ds1 : ds2);
        template.update(
            "INSERT INTO users (id, name, gender) VALUES (?, ?, ?)",
            user.getId(), user.getName(), user.getGender()
        );
    }
    
    // Truy vấn từ shard cụ thể
    public User findUserById(Long userId) {
        int shardId = getShardId(userId);
        JdbcTemplate template = new JdbcTemplate(shardId == 0 ? ds1 : ds2);
        return template.queryForObject(
            "SELECT * FROM users WHERE id = ?",
            new Object[]{userId},
            userRowMapper()
        );
    }
    
    // Truy vấn từ ALL shards (scatter-gather)
    public List<User> findAllUsersByGender(String gender) {
        List<User> results = new ArrayList<>();
        for (DataSource ds : Arrays.asList(ds1, ds2)) {
            JdbcTemplate template = new JdbcTemplate(ds);
            results.addAll(
                template.query(
                    "SELECT * FROM users WHERE gender = ?",
                    new Object[]{gender},
                    userRowMapper()
                )
            );
        }
        return results;
    }
    
    private RowMapper<User> userRowMapper() {
        return (rs, rowNum) -> new User(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getString("gender")
        );
    }
}
```

### 📊 Hiệu Suất So Sánh

| Kích Thước Dữ Liệu | Không Sharding | Sharding 2 | Sharding 4 |
|-------------------|----------------|-----------|-----------|
| 10M rows, Query   | **850ms** ❌   | 420ms ✅  | 210ms ✅✅ |
| 10M rows, Index   | 15s ❌         | 7.5s ✅   | 4s ✅✅   |
| Memory (Index)    | 2GB ❌         | 1GB ✅    | 500MB ✅✅|

### ⚠️ Thách Thức

| Thách Thức | Giải Pháp |
|-----------|----------|
| **Hotspot shard** (một shard bị quá tải) | Sử dụng Consistent Hashing hoặc re-shard |
| **Cross-shard query** (JOIN từ nhiều shard) | Giảm thiểu, hoặc denormalize |
| **Transactions** (Distributed TX) | Sử dụng eventual consistency |
| **Re-sharding** (Thêm shard mới) | Dùng bảng directory + offline migration |

---

## 2. 📥 Phân Mảnh Dọc (Vertical Partitioning - Normalization)

### 🎯 Khái Niệm
Chia **các cột** (column) của bảng gốc thành nhiều bảng nhỏ hơn. Mỗi bảng liên kết qua **khóa chính (ID)**. Phù hợp khi có **cột nặng** hoặc **truy cập không đều**.

### 💡 Khi Nào Sử Dụng?
- ✅ Có cột BLOB/TEXT lớn (avatar, description)
- ✅ Một số cột **truy cập rất thường xuyên**, số khác **hiếm khi cần**
- ✅ Cần **tối ưu cache/memory**
- ✅ Ví dụ: User profile, Product + detailed description

### 📝 Ví Dụ Thực Tế

**Trước khi tách:**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    avatar LONGBLOB,      -- 5MB trung bình
    bio TEXT,             -- 50KB trung bình
    address VARCHAR(500)
);
```

**Sau khi tách (Vertical Partitioning):**

**📌 Table: user_profile** (Truy cập 1000 lần/giây)
```sql
CREATE TABLE users_profile (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);
-- Size: ~300 bytes/row
-- Cache hit: ✅ Tốt
```

**📌 Table: user_heavy** (Truy cập 10 lần/giây)
```sql
CREATE TABLE users_heavy (
    id INT PRIMARY KEY,
    avatar LONGBLOB,
    bio TEXT,
    address VARCHAR(500),
    FOREIGN KEY (id) REFERENCES users_profile(id)
);
-- Size: ~5MB/row
-- Chỉ load khi cần
```

### 💻 Triển Khai Spring Boot

```java
// Entity cho thông tin cơ bản
@Entity
@Table(name = "users_profile")
public class UserProfile {
    @Id
    private Long id;
    private String name;
    private String email;
    // Relationship tới UserHeavy
    @OneToOne(mappedBy = "profile", fetch = FetchType.LAZY)
    private UserHeavy heavy;
}

// Entity cho thông tin nặng
@Entity
@Table(name = "users_heavy")
public class UserHeavy {
    @Id
    private Long id;
    
    @Lob
    private byte[] avatar;
    
    @Lob
    private String bio;
    
    private String address;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id")
    private UserProfile profile;
}

// Service sử dụng
@Service
public class UserService {
    
    @Autowired
    private UserProfileRepository profileRepo;
    
    @Autowired
    private UserHeavyRepository heavyRepo;
    
    // Lấy thông tin cơ bản nhanh
    public UserProfile getBasicInfo(Long userId) {
        return profileRepo.findById(userId).orElse(null);
        // Query 1: SELECT name, email FROM users_profile WHERE id=?
        // ~300 byte, Cache hit cao ✅
    }
    
    // Lấy thông tin cầu kỳ (khi cần)
    public UserHeavy getDetailedInfo(Long userId) {
        return heavyRepo.findById(userId).orElse(null);
        // Query 2: SELECT avatar, bio, address FROM users_heavy WHERE id=?
        // ~5MB, Load khi cần ✅
    }
    
    // Kết hợp cả hai
    public UserDTO getUserComplete(Long userId) {
        UserProfile profile = getBasicInfo(userId);
        UserHeavy heavy = getDetailedInfo(userId);
        return new UserDTO(profile, heavy);
    }
}

// Repository
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {}

@Repository
public interface UserHeavyRepository extends JpaRepository<UserHeavy, Long> {}
```

### 📊 Hiệu Suất So Sánh

| Kích Thước | Không Tách | Tách Dọc |
|-----------|-----------|---------|
| Lấy profile | **5.5MB transfer** | **300B transfer** ✅✅ |
| Cache size | 5MB/user ❌ | 300B/user ✅ |
| Query time | 120ms | 5ms + 80ms (lazy) |
| GC pressure | 🔴 Cao | 🟢 Thấp |

### ✅ Ưu Điểm

- **Cache hiệu quả:** Chỉ cache dữ liệu cơ bản (~300B)
- **Network tối ưu:** Giảm 95% bandwidth cho common queries
- **Memory tiêu kiệm:** RAM không phí vào BLOB/TEXT
- **Query nhanh:** Index trên `users_profile` siêu nhanh
- **IO hiệu quả:** Page size nhỏ = read from disk nhanh hơn

### ⚠️ Nhược Điểm

- **Phức tạp JOIN:** Hai bảng cần JOIN lại
- **Consistency:** Phải quản lý FK cẩn thận
- **Code phức tạp:** Nhiều query hơn

---

## 3. 🔀 Phân Mảnh Theo Chức Năng (Functional/Domain Partitioning)

### 🎯 Khái Niệm
Chia cơ sở dữ liệu thành **nhiều database độc lập** dựa trên **nhóm chức năng** hoặc **bounded context** (theo DDD). Mỗi module quản lý **business domain riêng**.

### 💡 Khi Nào Sử Dụng?
- ✅ Kiến trúc **Microservices**
- ✅ Các module có **ngữ cảnh kinh doanh khác nhau** rõ rệt
- ✅ Cần **scale độc lập từng service**
- ✅ Ví dụ: E-commerce (User, Order, Payment, Inventory)

### 📝 Ví Dụ Kiến Trúc E-Commerce

```
┌─────────────────────────────────────────────────────┐
│          API Gateway (Port 8000)                    │
└─────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   User Svc   │  │  Order Svc   │  │ Payment Svc  │
│  (8001)      │  │  (8002)      │  │  (8003)      │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       ▼                 ▼                  ▼
  ┌─────────┐       ┌─────────┐       ┌─────────┐
  │ user_db │       │order_db │       │payment_ │
  │ (5GB)   │       │ (50GB)  │       │ (30GB)  │
  └─────────┘       └─────────┘       └─────────┘
```

### 💻 Triển Khai Spring Boot Microservices

**📌 Service 1: User Service (Port 8001)**
```java
// application-user.yml
spring:
  datasource:
    url: jdbc:mysql://db-user:3306/user_db
    username: user_admin
    password: ${DB_USER_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate

@SpringBootApplication
@EnableEurekaClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserRepository userRepo;
    
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepo.save(user);
    }
    
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userRepo.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
    }
}
```

**📌 Service 2: Order Service (Port 8002)**
```java
// application-order.yml
spring:
  datasource:
    url: jdbc:mysql://db-order:3306/order_db
    
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    @Autowired
    private OrderRepository orderRepo;
    
    @Autowired
    private RestTemplate restTemplate; // Gọi User Service
    
    @PostMapping
    public Order createOrder(@RequestBody OrderRequest req) {
        // Gọi User Service để validate user
        User user = restTemplate.getForObject(
            "http://user-service:8001/api/users/" + req.getUserId(),
            User.class
        );
        
        if (user == null) {
            throw new InvalidUserException(req.getUserId());
        }
        
        Order order = new Order(req.getUserId(), req.getItems());
        return orderRepo.save(order);
    }
}
```

**📌 Service 3: Payment Service (Port 8003)**
```java
// application-payment.yml
spring:
  datasource:
    url: jdbc:mysql://db-payment:3306/payment_db

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    
    @Autowired
    private PaymentRepository paymentRepo;
    
    @PostMapping
    public Payment processPayment(@RequestBody PaymentRequest req) {
        // Gọi Order Service
        Order order = restTemplate.getForObject(
            "http://order-service:8002/api/orders/" + req.getOrderId(),
            Order.class
        );
        
        // Xử lý thanh toán
        Payment payment = new Payment(req.getOrderId(), order.getTotalAmount());
        payment.setStatus("PROCESSING");
        payment = paymentRepo.save(payment);
        
        // Event-driven: Publish event
        paymentEventPublisher.publishPaymentProcessed(payment);
        
        return payment;
    }
}
```

**📌 API Gateway (Port 8000)**
```java
@SpringBootApplication
@EnableGateway
public class ApiGatewayApplication {
    
    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("user-service", r -> r
                .path("/api/users/**")
                .uri("http://user-service:8001"))
            .route("order-service", r -> r
                .path("/api/orders/**")
                .uri("http://order-service:8002"))
            .route("payment-service", r -> r
                .path("/api/payments/**")
                .uri("http://payment-service:8003"))
            .build();
    }
}
```

### 📊 Kiến Trúc Chi Tiết

```
┌────────────────────────────────────────────────────────┐
│             CLIENT (Web, Mobile, App)                  │
└────────────────────────────────────────────────────────┘
                         │
                         ▼
            ┌──────────────────────────┐
            │    API Gateway           │
            │  (Request routing,       │
            │   Load balancing,        │
            │   Auth token validation) │
            └────┬─────────┬──────┬─────┘
                 │         │      │
    ┌────────────┘         │      └──────────────┐
    │                      │                     │
    ▼                      ▼                      ▼
┌─────────────┐     ┌────────────┐        ┌─────────────┐
│ User        │     │ Order      │        │ Payment     │
│ Microservice│     │ Microservice│        │ Microservice│
│ Port 8001   │     │ Port 8002  │        │ Port 8003   │
│             │     │            │        │             │
│ ├─ Register │     │ ├─ Create  │        │ ├─ Pay      │
│ ├─ Login    │     │ ├─ Track   │        │ ├─ Refund   │
│ ├─ Profile  │     │ ├─ Cancel  │        │ ├─ Invoice  │
└──────┬──────┘     └─────┬──────┘        └──────┬──────┘
       │                  │                      │
       ▼                  ▼                      ▼
   ┌─────────┐        ┌──────────┐          ┌──────────┐
   │user_db  │        │ order_db │          │payment_db│
   │MySQL    │        │ MongoDB  │          │ MySQL    │
   │ 5GB     │        │ 50GB     │          │ 30GB     │
   └─────────┘        └──────────┘          └──────────┘
```

### ✅ Ưu Điểm

| Lợi ích | Chi Tiết |
|--------|---------|
| **Độc lập tuyệt đối** | Mỗi service có stack riêng |
| **Scale độc lập** | Bảo trì User Service không ảnh hưởng Payment |
| **Tech stack linh hoạt** | User dùng MySQL, Order dùng MongoDB |
| **Team độc lập** | Mỗi team quản lý service riêng |
| **Deploy nhanh** | Chỉ deploy 1 service cần thay đổi |
| **Failure isolation** | Payment down ≠ User down |

### ⚠️ Thách Thức & Giải Pháp

| Vấn Đề | Giải Pháp |
|--------|----------|
| **Cross-service query** | Message queue, Event streaming |
| **Distributed transactions** | Saga pattern, compensating transactions |
| **Consistency** | Eventual consistency + retry mechanism |
| **Network latency** | Caching, service mesh, GraphQL federation |
| **Monitoring phức tạp** | ELK stack, distributed tracing (Jaeger) |

---

## 4. 🎯 Bảng So Sánh Các Chiến Lược

```
┌─────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   Tiêu chí  │  HORIZONTAL  │   VERTICAL   │ FUNCTIONAL   │  DIRECTORY   │
├─────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Phân chia   │ Rows         │ Columns      │ Database     │ Hybrid       │
│ Phức tạp    │ Trung bình   │ Thấp         │ Cao          │ Cao          │
│ Scale       │ Ngang ⬅️➡️    │ Dọc ⬆️⬇️    │ Ngang ⬅️➡️    │ Tuỳ chỉnh   │
│ Join/Query  │ Khó ❌       │ Dễ ✅        │ Khó ❌       │ Trung bình   │
│ Consistency │ Khó ❌       │ Dễ ✅        │ Khó ❌       │ Trung bình   │
│ Hot spot    │ Có thể ⚠️    │ Không ✅     │ Không ✅     │ Có thể ⚠️    │
│ Re-balance  │ Khó ❌       │ Không ✅     │ Dễ ✅        │ Dễ ✅        │
└─────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 5. 🚀 Real-World Use Cases

### 📱 **Case 1: YouTube (Billions of Videos)**
```
Horizontal Partitioning:
├─ Shard by video_id hash → 1000 shards
├─ Mỗi shard: 10 triệu videos
└─ Query latency: ~50ms nationwide

Vertical Partitioning:
├─ video_metadata: (id, title, creator, likes)
└─ video_content: (id, encoded_video, thumbnails)
```

### 💳 **Case 2: Stripe/PayPal (Payment Processing)**
```
Functional Partitioning:
├─ Transaction DB (hot, < 1s latency)
├─ Settlement DB (batch, eventual consistency)
├─ Dispute DB (reference, slow)
└─ Reporting DB (analytics, denormalized)
```

### 🛍️ **Case 3: Amazon (E-commerce)**
```
Hybrid Strategy:
├─ Functional: User / Order / Inventory / Payment
└─ Within Order Service:
   ├─ Horizontal: by seller_id (100K sellers)
   └─ Vertical: order_summary + order_items
```

---

## ✨ Kết Luận

| Tình Huống | Chiến Lược Khuyên |
|-----------|------------------|
| Bảng tăng trưởng nhanh (>10M rows) | **Horizontal** |
| Có cột BLOB/Text nặng | **Vertical** |
| Kiến trúc Microservices | **Functional** |
| Cần linh hoạt cao | **Directory-based** |
| Dữ liệu nhỏ (<1M rows) | **Không cần partitioning** |

---

**💪 Hãy nhớ:** *"Premature optimization is the root of all evil"* — Donald Knuth

Hãy **measure first**, **optimize second**, **partition last**! 📊

