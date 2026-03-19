//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    public static void main(String[] args) {
        Order order = new Order();

        Observer c1 = new Customer("Hao");
        Observer c2 = new Customer("An");

        order.addObserver(c1);
        order.addObserver(c2);

        order.setStatus("Shipped");
        order.setStatus("Delivered");
    }
}