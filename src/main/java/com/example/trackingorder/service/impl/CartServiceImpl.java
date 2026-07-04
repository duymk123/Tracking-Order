package com.example.trackingorder.service.impl;

import com.example.trackingorder.common.StockStatusEnum;
import com.example.trackingorder.config.basicauthconfig.AuthenticationFacade;
import com.example.trackingorder.configmapper.CartItemMapper;
import com.example.trackingorder.dto.request.AddToCartReq;
import com.example.trackingorder.dto.response.CartItemRes;
import com.example.trackingorder.dto.response.CartRes;
import com.example.trackingorder.entity.*;
import com.example.trackingorder.exception.BadRequestException;
import com.example.trackingorder.exception.NotFoundException;
import com.example.trackingorder.repository.CartItemRepo;
import com.example.trackingorder.repository.CartRepo;
import com.example.trackingorder.repository.ProductVariantRepo;
import com.example.trackingorder.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CartServiceImpl implements CartService {
    private final CartRepo cartRepo;
    private final CartItemRepo cartItemRepo;
    private final CartItemMapper cartItemMapper;
    private final AuthenticationFacade authenticationFacade;
    private final ProductVariantRepo productVariantRepo;

    @Override
    public CartRes getCurrentCart() {
        // lay cart tu user login
        User user = authenticationFacade.getCurrentUser();
        log.info("Getting current cart for user {}", user.getUsername());

        //Lay cart cua user
        Cart cart = cartRepo.findByUser(user)
                .orElseThrow(() -> {
                    log.error("cart not found");
                    return new NotFoundException(HttpStatus.NOT_FOUND, "Cart not found");
                });

        // Lay cart item
        List<CartItem> cartItems = cartItemRepo.findAllByCart(cart);
        log.info("Found {} cartItems", cartItems.size());

        // convert entity
        List<CartItemRes> cartItemResList = cartItemMapper.toCartItemList(cartItems);

        for (CartItemRes items : cartItemResList) {
            Integer quantityInStock = items.getQuantityInStock();
            if (quantityInStock == null || quantityInStock == 0) {
                items.setStockStatus(StockStatusEnum.OUT_OF_STOCK.name());
            } else if (quantityInStock <= 10) {
                items.setStockStatus(StockStatusEnum.LIMITED_STOCK.name());
            } else {
                items.setStockStatus(StockStatusEnum.IN_STOCK.name());
            }
        }
        log.info("Get Current Cart Successfull");
        return CartRes.builder().items(cartItemResList).build();
    }

    @Override
    public CartRes addToCart(AddToCartReq req) {
        // lay tu user
        User user = authenticationFacade.getCurrentUser();
        log.info("Adding to cart for user {}", user.getUsername());

        // lay cart
        Cart cart = cartRepo.findByUser(user)
                .orElseThrow(() -> new NotFoundException(HttpStatus.NOT_FOUND, "Cart not found"));

        //lay ra variant -> check xem co variant do ko
        ProductVariant productVariant = productVariantRepo.findById(
                        req.getProductVariantId()) //
                .orElseThrow(() -> new NotFoundException(HttpStatus.NOT_FOUND, "Product Variant not found"));

        // Check inventory
        Inventory inventory = productVariant.getInventory();
        if (inventory == null) {
            throw new NotFoundException(HttpStatus.NOT_FOUND, "Inventory not found");
        } else if (inventory.getQuantityInStock() <= 0) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, "Inventory is out of stock");
        }

        // Check xem cartItem existed
        Optional<CartItem> optionalCartItem = cartItemRepo.findByCartAndProductVariant(cart, productVariant);
        if (optionalCartItem.isPresent()) { // neu da co trong cart
            CartItem cartItem = optionalCartItem.get();

            int newQuantity = cartItem.getQuantity() + req.getQuantity(); // newQuantity = quantity(hien tai trong item + quantity truyen vao tu req)

            if (newQuantity > inventory.getQuantityInStock()) {
                throw new BadRequestException(HttpStatus.BAD_REQUEST, "Not enough stock");
            }

            cartItem.setQuantity(newQuantity); // update quantity
            cartItemRepo.save(cartItem);
            log.info("Updated quantity to {}", newQuantity);

        } else { //Them item moi( chua co trong cart)
            if (req.getQuantity() > inventory.getQuantityInStock()) {
                throw new BadRequestException(HttpStatus.BAD_REQUEST, "Not enough stock");
            }

            //tinh price cua variant
            BigDecimal finalPrice =
                    productVariant
                            .getProduct()
                            .getBasePrice()
                            .add(productVariant.getPriceModifier());

            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .productVariant(productVariant)
                    .quantity(req.getQuantity())
                    .priceSnapshot(finalPrice)
                    .build();
            cartItemRepo.save(cartItem);

            log.info("Created new cartItem");
        }

        return getCurrentCart();

    }
}
