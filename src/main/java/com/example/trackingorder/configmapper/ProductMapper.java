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
    @Mapping(target = "inStock", expression = "java(isInStock(product))")
    @Mapping(target = "productId", source = "id")
    @Mapping(target = "productName", source = "name" )
    ProductRes toProductRes(Product product);

    List<ProductRes> toProductResList(List<Product> products);

    @Mapping(target = "categoryName", source = "productCategory.name")
    @Mapping(target = "quantityInStock", expression = "java(calculateTotalInStock(product))")
    @Mapping(target = "productId", source = "id")
    @Mapping(target = "productName", source = "name" )
    ProductDetailRes toProductDetailRes(Product product);

    default boolean isInStock(Product product) {
        return calculateTotalInStock(product) > 0;
    }

    default Integer calculateTotalInStock(Product product) {
        if (product.getProductVariants() == null) {
            return 0;
        }
        return product.getProductVariants().stream()
                .filter(v -> v.getInventory() != null && v.getInventory().getQuantityInStock() != null)
                .mapToInt(v -> v.getInventory().getQuantityInStock())
                .sum();
    }
}
