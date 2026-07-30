package com.example.trackingorder.service.impl;

import com.example.trackingorder.configmapper.ProductMapper;
import com.example.trackingorder.dto.response.ProductDetailRes;
import com.example.trackingorder.dto.response.ProductRes;
import com.example.trackingorder.entity.Product;
import com.example.trackingorder.exception.NotFoundException;
import com.example.trackingorder.repository.ProductRepo;
import com.example.trackingorder.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepo productRepo;
    private final ProductMapper productMapper;


    @Override
    @Transactional(readOnly = true)
    public List<ProductRes> getAll() {
        List<Product> products = productRepo.findAllProduct();

        return productMapper.toProductResList(products);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailRes getById(String id) {
        Product product = productRepo.findProductDetail(id)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Product not found"));

        return productMapper.toProductDetailRes(product);
    }
}
