package com.example.trackingorder.service;

import com.example.trackingorder.dto.request.AddToCartReq;
import com.example.trackingorder.dto.request.UpdateCartReq;
import com.example.trackingorder.dto.response.CartRes;
import com.example.trackingorder.entity.Cart;

public interface CartService {
    CartRes getCurrentCart();

    CartRes addToCart(AddToCartReq req);

//    CartRes updateCartItem(UpdateCartReq req);
}
