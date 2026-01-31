// ===== STATE =====
const Order = require("./state/Order");
const NewOrderState = require("./state/NewOrderState");
const ShippingState = require("./state/ShippingState");
const CompletedState = require("./state/CompletedState");

// ===== STRATEGY =====
const ShoppingCart = require("./strategy/ShoppingCart");
const CashPayment = require("./strategy/CashPayment");
const CardPayment = require("./strategy/CardPayment");

// ===== DECORATOR =====
const Coffee = require("./decorator/Coffee");
const MilkDecorator = require("./decorator/MilkDecorator");
const SugarDecorator = require("./decorator/SugarDecorator");

// ---------------- STATE ----------------
console.log("\n=== STATE PATTERN ===");
const order = new Order();

order.setState(new NewOrderState());
order.process();

order.setState(new ShippingState());
order.process();

order.setState(new CompletedState());
order.process();

// ---------------- STRATEGY ----------------
console.log("\n=== STRATEGY PATTERN ===");
const cart = new ShoppingCart();

cart.setPaymentStrategy(new CashPayment());
cart.checkout(100);

cart.setPaymentStrategy(new CardPayment());
cart.checkout(200);

// ---------------- DECORATOR ----------------
console.log("\n=== DECORATOR PATTERN ===");
let coffee = new Coffee();
console.log("☕ Giá gốc:", coffee.cost());

coffee = new MilkDecorator(coffee);
coffee = new SugarDecorator(coffee);

console.log("☕ Giá sau khi thêm sữa + đường:", coffee.cost());
