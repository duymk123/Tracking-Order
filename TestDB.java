import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestDB {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/tracking_order?user=root&password=root");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT u.username, u.role, c.id AS cart_id FROM users u LEFT JOIN Carts c ON u.id = c.user_id ORDER BY u.create_at DESC LIMIT 5");
            while (rs.next()) {
                System.out.println("User: " + rs.getString("username") + ", Role: " + rs.getString("role") + ", CartID: " + rs.getString("cart_id"));
            }
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
