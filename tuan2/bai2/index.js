/*
 * BÀI TẬP TUẦN 2 - CÁC DESIGN PATTERN: STATE, STRATEGY, DECORATOR
 * Tác giả: Nguyen Duc Duy - 22678211
 * 
 * Mô tả: 
 * - Bài 1: Hệ thống quản lý đơn hàng (Order Management System)
 * - Bài 2: Tính toán thuế cho sản phẩm (Tax Calculation System)
 * - Bài 3: Hệ thống thanh toán (Payment System)
 */

console.log("═══════════════════════════════════════════════════════════════");
console.log("   BÀI TẬP DESIGN PATTERNS - TUẦN 2");
console.log("   State, Strategy, Decorator Patterns");
console.log("═══════════════════════════════════════════════════════════════\n");

// ============================================================================
// BÀI 1: HỆ THỐNG QUẢN LÝ ĐơN HÀNG (ORDER MANAGEMENT SYSTEM)
// ============================================================================
console.log("\n╔═══════════════════════════════════════════════════════════════╗");
console.log("║  BÀI 1: HỆ THỐNG QUẢN LÝ ĐƠN HÀNG                            ║");
console.log("╚═══════════════════════════════════════════════════════════════╝");

// Import Bài 1
const Order = require("./bai1_order_management/state/Order");
const NewOrderState_B1 = require("./bai1_order_management/state/NewOrderState");
const ProcessingState_B1 = require("./bai1_order_management/state/ProcessingState");
const DeliveredState = require("./bai1_order_management/state/DeliveredState");
const CancelledState = require("./bai1_order_management/state/CancelledState");

const CashPayment = require("./bai1_order_management/strategy/CashPayment");
const CardPayment = require("./bai1_order_management/strategy/CardPayment");
const BankTransferPayment = require("./bai1_order_management/strategy/BankTransferPayment");

const InsuranceDecorator = require("./bai1_order_management/decorator/InsuranceDecorator");
const GiftWrapDecorator = require("./bai1_order_management/decorator/GiftWrapDecorator");
const ExpressShippingDecorator = require("./bai1_order_management/decorator/ExpressShippingDecorator");

console.log("\n📋 Demo: Đơn hàng với các trạng thái khác nhau");
console.log("─────────────────────────────────────────────────────────────");

// Tạo đơn hàng
let order1 = new Order("ORD001", 500000);

// Áp dụng Decorator để thêm tính năng
order1 = new InsuranceDecorator(order1, 50000);
order1 = new GiftWrapDecorator(order1, 20000);
order1 = new ExpressShippingDecorator(order1, 100000);

// State Pattern: Chuyển đổi trạng thái đơn hàng
order1.setState(new NewOrderState_B1());
order1.process();

order1.setState(new ProcessingState_B1());
order1.process();

order1.setState(new DeliveredState());
order1.process();

// Strategy Pattern: Thanh toán
console.log("\n💰 Thanh toán đơn hàng:");
order1.setPaymentStrategy(new CardPayment());
order1.checkout();

console.log(`\n✅ Tổng giá trị đơn hàng: ${order1.getTotalAmount()} VND`);

// Demo đơn hàng bị hủy
console.log("\n\n📋 Demo: Đơn hàng bị hủy");
console.log("─────────────────────────────────────────────────────────────");
const order2 = new Order("ORD002", 300000);
order2.setState(new NewOrderState_B1());
order2.process();

order2.setState(new CancelledState());
order2.process();

// ============================================================================
// BÀI 2: TÍNH TOÁN THUẾ CHO SẢN PHẨM (TAX CALCULATION SYSTEM)
// ============================================================================
console.log("\n\n╔═══════════════════════════════════════════════════════════════╗");
console.log("║  BÀI 2: TÍNH TOÁN THUẾ CHO SẢN PHẨM                          ║");
console.log("╚═══════════════════════════════════════════════════════════════╝");

// Import Bài 2
const Product = require("./bai2_tax_calculation/state/Product");
const NewProductState_B2 = require("./bai2_tax_calculation/state/NewProductState");
const SoldProductState_B2 = require("./bai2_tax_calculation/state/SoldProductState");
const DiscountedProductState_B2 = require("./bai2_tax_calculation/state/DiscountedProductState");

const VATTax = require("./bai2_tax_calculation/strategy/VATTax");
const ConsumptionTax = require("./bai2_tax_calculation/strategy/ConsumptionTax");
const LuxuryTax = require("./bai2_tax_calculation/strategy/LuxuryTax");

const ShippingFeeDecorator = require("./bai2_tax_calculation/decorator/ShippingFeeDecorator");
const WarrantyDecorator = require("./bai2_tax_calculation/decorator/WarrantyDecorator");
const PackagingDecorator = require("./bai2_tax_calculation/decorator/PackagingDecorator");

console.log("\n📦 Demo: Sản phẩm điện tử với thuế VAT");
console.log("─────────────────────────────────────────────────────────────");

let product1 = new Product("Laptop Dell XPS 13", 20000000);

// State Pattern
product1.setState(new NewProductState_B2());
product1.process();

// Strategy Pattern: Áp dụng thuế VAT 10%
product1.setTaxStrategy(new VATTax(0.1));
console.log(`  Giá sản phẩm: ${product1.getPrice()} VND`);
product1.calculateTax();

// Decorator Pattern: Thêm phí
product1 = new ShippingFeeDecorator(product1, 30000);
product1 = new WarrantyDecorator(product1, 500000);

console.log(`\n✅ Tổng giá cuối cùng: ${product1.getTotalPrice()} VND`);

console.log("\n\n🍷 Demo: Sản phẩm xa xỉ với thuế cao");
console.log("─────────────────────────────────────────────────────────────");

let product2 = new Product("Đồng hồ Rolex", 500000000);

// State Pattern
product2.setState(new SoldProductState_B2());
product2.process();

// Strategy Pattern: Thuế xa xỉ 25%
product2.setTaxStrategy(new LuxuryTax(0.25));
console.log(`  Giá sản phẩm: ${product2.getPrice()} VND`);
product2.calculateTax();

// Decorator Pattern
product2 = new PackagingDecorator(product2, 200000);

console.log(`\n✅ Tổng giá cuối cùng: ${product2.getTotalPrice()} VND`);

console.log("\n\n🏷️ Demo: Sản phẩm giảm giá với thuế tiêu thụ");
console.log("─────────────────────────────────────────────────────────────");

let product3 = new Product("Rượu vang cao cấp", 5000000);

// State Pattern: Giảm giá 20%
product3.setState(new DiscountedProductState_B2());
product3.process();

// Strategy Pattern: Thuế tiêu thụ 15%
product3.setTaxStrategy(new ConsumptionTax(0.15));
console.log(`  Giá sản phẩm sau giảm: ${product3.getPrice()} VND`);
product3.calculateTax();

console.log(`\n✅ Tổng giá cuối cùng: ${product3.getTotalPrice()} VND`);

// ============================================================================
// BÀI 3: HỆ THỐNG THANH TOÁN (PAYMENT SYSTEM)
// ============================================================================
console.log("\n\n╔═══════════════════════════════════════════════════════════════╗");
console.log("║  BÀI 3: HỆ THỐNG THANH TOÁN                                  ║");
console.log("╚═══════════════════════════════════════════════════════════════╝");

// Import Bài 3
const Transaction = require("./bai3_payment_system/state/Transaction");
const PendingState_B3 = require("./bai3_payment_system/state/PendingState");
const ProcessingState_B3 = require("./bai3_payment_system/state/ProcessingState");
const CompletedState_B3 = require("./bai3_payment_system/state/CompletedState");
const FailedState_B3 = require("./bai3_payment_system/state/FailedState");

const CreditCardPayment_B3 = require("./bai3_payment_system/strategy/CreditCardPayment");
const PayPalPayment_B3 = require("./bai3_payment_system/strategy/PayPalPayment");
const BankTransferPayment_B3 = require("./bai3_payment_system/strategy/BankTransferPayment");

const ProcessingFeeDecorator = require("./bai3_payment_system/decorator/ProcessingFeeDecorator");
const DiscountCodeDecorator = require("./bai3_payment_system/decorator/DiscountCodeDecorator");
const LoyaltyPointsDecorator = require("./bai3_payment_system/decorator/LoyaltyPointsDecorator");

console.log("\n💳 Demo: Thanh toán qua thẻ tín dụng");
console.log("─────────────────────────────────────────────────────────────");

let transaction1 = new Transaction("TXN001", 1000000);

// Decorator Pattern: Thêm phí xử lý và tích điểm
transaction1 = new ProcessingFeeDecorator(transaction1, 0.02); // 2% phí
transaction1 = new LoyaltyPointsDecorator(transaction1, 100);

// State Pattern: Chuyển đổi trạng thái
transaction1.setState(new PendingState_B3());
transaction1.process();

transaction1.setState(new ProcessingState_B3());
transaction1.process();

// Strategy Pattern: Chọn phương thức thanh toán
transaction1.setPaymentMethod(new CreditCardPayment_B3());
transaction1.executePayment();

transaction1.setState(new CompletedState_B3());
transaction1.process();

console.log(`\n✅ Tổng số tiền đã thanh toán: ${transaction1.getAmount()} VND`);

console.log("\n\n💰 Demo: Thanh toán PayPal với mã giảm giá");
console.log("─────────────────────────────────────────────────────────────");

let transaction2 = new Transaction("TXN002", 2000000);

// Decorator Pattern: Áp dụng mã giảm giá
transaction2 = new DiscountCodeDecorator(transaction2, 0.15); // Giảm 15%
transaction2 = new ProcessingFeeDecorator(transaction2, 0.025); // 2.5% phí
transaction2 = new LoyaltyPointsDecorator(transaction2, 200);

transaction2.setState(new PendingState_B3());
transaction2.process();

transaction2.setState(new ProcessingState_B3());
transaction2.process();

transaction2.setPaymentMethod(new PayPalPayment_B3());
transaction2.executePayment();

transaction2.setState(new CompletedState_B3());
transaction2.process();

console.log(`\n✅ Tổng số tiền đã thanh toán: ${transaction2.getAmount()} VND`);

console.log("\n\n🏦 Demo: Thanh toán thất bại");
console.log("─────────────────────────────────────────────────────────────");

const transaction3 = new Transaction("TXN003", 5000000);

transaction3.setState(new PendingState_B3());
transaction3.process();

transaction3.setState(new ProcessingState_B3());
transaction3.process();

transaction3.setState(new FailedState_B3());
transaction3.process();

// ============================================================================
// KẾT LUẬN
// ============================================================================
console.log("\n\n╔═══════════════════════════════════════════════════════════════╗");
console.log("║  KẾT LUẬN                                                     ║");
console.log("╚═══════════════════════════════════════════════════════════════╝");

console.log(`
📌 STATE PATTERN:
   - Cho phép đối tượng thay đổi hành vi khi trạng thái thay đổi
   - Tránh sử dụng if-else/switch-case phức tạp
   - Dễ dàng thêm trạng thái mới
   - Áp dụng: Đơn hàng, Sản phẩm, Giao dịch

📌 STRATEGY PATTERN:
   - Cho phép lựa chọn thuật toán tại runtime
   - Tách biệt các thuật toán thành các class riêng
   - Dễ dàng thay đổi và mở rộng
   - Áp dụng: Phương thức thanh toán, Tính thuế

📌 DECORATOR PATTERN:
   - Thêm chức năng mới mà không sửa code gốc
   - Kết hợp nhiều decorator linh hoạt
   - Tuân thủ Open/Closed Principle
   - Áp dụng: Thêm phí, bảo hiểm, giảm giá, tích điểm

✅ Kết hợp 3 patterns giúp code:
   - Dễ bảo trì và mở rộng
   - Tái sử dụng cao
   - Tuân thủ SOLID principles
   - Linh hoạt trong thay đổi yêu cầu
`);

console.log("═══════════════════════════════════════════════════════════════");
console.log("   KẾT THÚC DEMO");
console.log("═══════════════════════════════════════════════════════════════\n");
