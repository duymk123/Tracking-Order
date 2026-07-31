package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.response.ProductVariantRes;
import com.example.trackingorder.entity.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {
    @Mapping(target = "quantityInStock", expression = "java(variant.getInventory() != null ? variant.getInventory().getQuantityInStock() : 0)")
    ProductVariantRes toProductVariantRes(ProductVariant variant);

    List<ProductVariantRes> toProductVariantResList(List<ProductVariant> variants);
}
