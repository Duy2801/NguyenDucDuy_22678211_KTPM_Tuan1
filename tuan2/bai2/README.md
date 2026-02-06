# BÀI TẬP TUẦN 2: DESIGN PATTERNS
**Tác giả:** Nguyễn Đức Duy - 22678211  
**Ngày:** Tuần 2 - Kiến trúc và Thiết kế Ứng dụng

---

## 📋 MÔ TẢ

Bài tập này triển khai 3 bài toán thực tế sử dụng các Design Patterns: **State**, **Strategy**, và **Decorator**.

---

## 🎯 CÁC DESIGN PATTERNS SỬ DỤNG

### 1. **STATE PATTERN**
- **Mục đích:** Cho phép đối tượng thay đổi hành vi khi trạng thái thay đổi
- **Lợi ích:** 
  - Tránh sử dụng if-else/switch-case phức tạp
  - Dễ dàng thêm trạng thái mới mà không ảnh hưởng code cũ
  - Mỗi trạng thái được đóng gói trong class riêng biệt

### 2. **STRATEGY PATTERN**
- **Mục đích:** Cho phép lựa chọn thuật toán/hành vi tại runtime
- **Lợi ích:**
  - Tách biệt các thuật toán thành các class riêng
  - Dễ dàng thay đổi và mở rộng
  - Tuân thủ Open/Closed Principle

### 3. **DECORATOR PATTERN**
- **Mục đích:** Thêm chức năng mới cho đối tượng mà không sửa code gốc
- **Lợi ích:**
  - Kết hợp nhiều decorator linh hoạt
  - Mở rộng tính năng động
  - Tuân thủ Single Responsibility Principle

---

## 📁 CẤU TRÚC DỰ ÁN

```
bai2/
├── index.js                                    # File demo chính
├── package.json
├── README.md
│
├── bai1_order_management/                      # BÀI 1: Quản lý đơn hàng
│   ├── state/
│   │   ├── OrderState.js                       # Base State
│   │   ├── NewOrderState.js                    # Trạng thái: Mới tạo
│   │   ├── ProcessingState.js                  # Trạng thái: Đang xử lý
│   │   ├── DeliveredState.js                   # Trạng thái: Đã giao
│   │   ├── CancelledState.js                   # Trạng thái: Đã hủy
│   │   └── Order.js                            # Context class
│   ├── strategy/
│   │   ├── PaymentStrategy.js                  # Base Strategy
│   │   ├── CashPayment.js                      # Thanh toán tiền mặt
│   │   ├── CardPayment.js                      # Thanh toán thẻ
│   │   └── BankTransferPayment.js              # Chuyển khoản ngân hàng
│   └── decorator/
│       ├── OrderDecorator.js                   # Base Decorator
│       ├── InsuranceDecorator.js               # Thêm bảo hiểm
│       ├── GiftWrapDecorator.js                # Thêm gói quà
│       └── ExpressShippingDecorator.js         # Vận chuyển nhanh
│
├── bai2_tax_calculation/                       # BÀI 2: Tính toán thuế
│   ├── state/
│   │   ├── ProductState.js                     # Base State
│   │   ├── NewProductState.js                  # Trạng thái: Mới
│   │   ├── SoldProductState.js                 # Trạng thái: Đã bán
│   │   ├── DiscountedProductState.js           # Trạng thái: Giảm giá
│   │   └── Product.js                          # Context class
│   ├── strategy/
│   │   ├── TaxStrategy.js                      # Base Strategy
│   │   ├── VATTax.js                           # Thuế VAT (10%)
│   │   ├── ConsumptionTax.js                   # Thuế tiêu thụ (15%)
│   │   └── LuxuryTax.js                        # Thuế xa xỉ (25%)
│   └── decorator/
│       ├── ProductDecorator.js                 # Base Decorator
│       ├── ShippingFeeDecorator.js             # Phí vận chuyển
│       ├── WarrantyDecorator.js                # Phí bảo hành
│       └── PackagingDecorator.js               # Phí đóng gói
│
└── bai3_payment_system/                        # BÀI 3: Hệ thống thanh toán
    ├── state/
    │   ├── TransactionState.js                 # Base State
    │   ├── PendingState.js                     # Trạng thái: Chờ xử lý
    │   ├── ProcessingState.js                  # Trạng thái: Đang xử lý
    │   ├── CompletedState.js                   # Trạng thái: Hoàn tất
    │   ├── FailedState.js                      # Trạng thái: Thất bại
    │   └── Transaction.js                      # Context class
    ├── strategy/
    │   ├── PaymentMethod.js                    # Base Strategy
    │   ├── CreditCardPayment.js                # Thanh toán thẻ tín dụng
    │   ├── PayPalPayment.js                    # Thanh toán PayPal
    │   └── BankTransferPayment.js              # Chuyển khoản
    └── decorator/
        ├── TransactionDecorator.js             # Base Decorator
        ├── ProcessingFeeDecorator.js           # Phí xử lý
        ├── DiscountCodeDecorator.js            # Mã giảm giá
        └── LoyaltyPointsDecorator.js           # Tích điểm thưởng
```

---

## 🚀 HƯỚNG DẪN CHẠY

### Yêu cầu:
- Node.js version 14 trở lên

### Các bước:

1. **Di chuyển vào thư mục bài 2:**
   ```bash
   cd tuan2/bai2
   ```

2. **Chạy chương trình:**
   ```bash
   node index.js
   ```

---

## 📝 CHI TIẾT CÁC BÀI TOÁN

### **BÀI 1: HỆ THỐNG QUẢN LÝ ĐƠN HÀNG**

#### Mô tả:
Xây dựng hệ thống quản lý đơn hàng với các trạng thái:
- **Mới tạo:** Kiểm tra thông tin đơn hàng
- **Đang xử lý:** Đóng gói và chuẩn bị vận chuyển
- **Đã giao:** Cập nhật trạng thái và gửi email xác nhận
- **Đã hủy:** Hủy đơn và hoàn tiền

#### Áp dụng Patterns:
- **State:** Quản lý các trạng thái đơn hàng
- **Strategy:** Các phương thức thanh toán (Tiền mặt, Thẻ, Chuyển khoản)
- **Decorator:** Thêm tính năng (Bảo hiểm, Gói quà, Vận chuyển nhanh)

#### Demo:
```javascript
let order = new Order("ORD001", 500000);
order = new InsuranceDecorator(order);      // Thêm bảo hiểm
order = new GiftWrapDecorator(order);       // Thêm gói quà
order.setState(new NewOrderState());        // Thiết lập trạng thái
order.process();                            // Xử lý đơn hàng
order.setPaymentStrategy(new CardPayment()); // Chọn phương thức
order.checkout();                           // Thanh toán
```

---

### **BÀI 2: TÍNH TOÁN THUẾ CHO SẢN PHẨM**

#### Mô tả:
Hệ thống tính thuế cho sản phẩm với nhiều loại thuế:
- **VAT (10%):** Thuế giá trị gia tăng
- **Thuế tiêu thụ (15%):** Cho các sản phẩm đặc biệt
- **Thuế xa xỉ (25%):** Cho hàng cao cấp

#### Áp dụng Patterns:
- **State:** Trạng thái sản phẩm (Mới, Đã bán, Giảm giá)
- **Strategy:** Các loại thuế khác nhau
- **Decorator:** Thêm phí (Vận chuyển, Bảo hành, Đóng gói)

#### Demo:
```javascript
let product = new Product("Laptop", 20000000);
product.setState(new NewProductState());
product.setTaxStrategy(new VATTax(0.1));    // Thuế VAT 10%
product = new ShippingFeeDecorator(product); // Phí vận chuyển
product = new WarrantyDecorator(product);    // Phí bảo hành
```

---

### **BÀI 3: HỆ THỐNG THANH TOÁN**

#### Mô tả:
Hệ thống thanh toán với nhiều phương thức và trạng thái:
- **Chờ xử lý → Đang xử lý → Hoàn tất**
- **Thất bại:** Xử lý lỗi và hoàn tiền

#### Áp dụng Patterns:
- **State:** Trạng thái giao dịch
- **Strategy:** Phương thức thanh toán (Thẻ, PayPal, Chuyển khoản)
- **Decorator:** Tính năng bổ sung (Phí xử lý, Mã giảm giá, Tích điểm)

#### Demo:
```javascript
let transaction = new Transaction("TXN001", 1000000);
transaction = new ProcessingFeeDecorator(transaction, 0.02);  // Phí 2%
transaction = new DiscountCodeDecorator(transaction, 0.1);    // Giảm 10%
transaction.setState(new PendingState());
transaction.setPaymentMethod(new CreditCardPayment());
transaction.executePayment();
```

---

## 💡 KẾT LUẬN

### **Lợi ích của việc kết hợp 3 Patterns:**

1. **State Pattern:**
   - Code rõ ràng, dễ hiểu
   - Dễ dàng thêm trạng thái mới
   - Tránh if-else phức tạp

2. **Strategy Pattern:**
   - Linh hoạt thay đổi thuật toán
   - Code module hóa cao
   - Dễ test từng strategy

3. **Decorator Pattern:**
   - Mở rộng tính năng linh hoạt
   - Không cần sửa code gốc
   - Kết hợp nhiều tính năng dễ dàng

### **Tuân thủ SOLID Principles:**
- ✅ **Single Responsibility:** Mỗi class có một trách nhiệm duy nhất
- ✅ **Open/Closed:** Mở để mở rộng, đóng để sửa đổi
- ✅ **Liskov Substitution:** Có thể thay thế các subclass
- ✅ **Interface Segregation:** Interface nhỏ, tập trung
- ✅ **Dependency Inversion:** Phụ thuộc vào abstraction

---

## 📚 TÀI LIỆU THAM KHẢO

- [Design Patterns: Elements of Reusable Object-Oriented Software](https://en.wikipedia.org/wiki/Design_Patterns)
- [Refactoring Guru - Design Patterns](https://refactoring.guru/design-patterns)
- [JavaScript Design Patterns](https://www.patterns.dev/)

---

**© 2026 Nguyễn Đức Duy - KTPM - Tuần 2**
