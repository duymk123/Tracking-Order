package com.example.trackingorder.repository;

import com.example.trackingorder.entity.Cart;
import com.example.trackingorder.entity.CartItem;
import com.example.trackingorder.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartItemRepo extends JpaRepository<CartItem, String> {
    @Query("""
            SELECT ci
            FROM CartItem ci
            JOIN FETCH ci.productVariant pv 
            JOIN FETCH pv.product p
            LEFT JOIN FETCH pv.inventory i
            WHERE ci.cart = :cart
            """)
    List<CartItem> findAllByCart(@Param("cart") Cart cart);
    //variant.getProduct().getName() variant -> product -> name
    //variant.getInventory().getQuantityInStock() variant -> inventory -> quantityInStock
    //WHERE ci.cart = :cart: (Lấy tất cả CartItem mà trường cart của nó bằng object cart mình truyền vào)

    // Lấy ra toàn bộ items trong cart hiện tại
    List<CartItem> findByCart(Cart cart);

    //tìm 1 item cụ thể để điều chỉnh số lượng
    Optional<CartItem> findByCartAndProductVariant(Cart cart, ProductVariant productVariant);
}
