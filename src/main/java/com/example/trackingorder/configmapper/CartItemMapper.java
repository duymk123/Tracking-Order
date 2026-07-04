package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.response.CartItemRes;
import com.example.trackingorder.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CartItemMapper {
    @Mapping(source = "productVariant.id",target = "productVariantId")
    @Mapping(source = "productVariant.product.name",target = "productName")
    @Mapping(source = "productVariant.sku",target = "sku")
    @Mapping(source = "priceSnapshot",target = "unitPrice")
    @Mapping(source = "quantity",target = "quantity")
    @Mapping(source = "productVariant.inventory.quantityInStock", target = "quantityInStock" )
    @Mapping(target = "stockStatus", ignore = true)
    CartItemRes toCartItem(CartItem cartItem);
    List<CartItemRes> toCartItemList(List<CartItem> cartItems);

}
