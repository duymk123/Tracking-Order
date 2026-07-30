package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.response.ProductDetailRes;
import com.example.trackingorder.dto.response.ProductRes;
import com.example.trackingorder.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(target = "categoryName", source = "productCategory.name")
    @Mapping(target = "quantityInStock",
            source = "inventory.quantityInStock")
    ProductRes toProductRes(Product product);

    List<ProductRes> toProductResList(List<Product> products);

    @Mapping(target = "categoryName", source = "productCategory.name")
    @Mapping(target = "quantityInStock",
            source = "inventory.quantityInStock")
    ProductDetailRes toProductDetailRes(Product product);
}
