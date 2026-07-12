package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.response.CartItemRes;
import com.example.trackingorder.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CartItemMapper {
    @Mapping(source = "productVariant.id",target = "productVariantId")
    @Mapping(source = "productVariant.product.name",target = "productName")
    @Mapping(source = "productVariant.sku",target = "sku")
    @Mapping(target = "price", expression = "java(calculatePrice(cartItem))")
    @Mapping(source = "quantity",target = "quantity")
    @Mapping(source = "productVariant.inventory.quantityInStock", target = "quantityInStock" )
    @Mapping(target = "stockStatus", ignore = true)
    CartItemRes toCartItem(CartItem cartItem);

    List<CartItemRes> toCartItemList(List<CartItem> cartItems);


    default BigDecimal calculatePrice(CartItem cartItem) {
        return cartItem.getProductVariant()
                .getProduct()
                .getBasePrice()
                .add(cartItem.getProductVariant().getPriceModifier());
    }
}
