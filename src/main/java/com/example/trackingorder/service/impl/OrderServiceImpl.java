package com.example.trackingorder.service.impl;

import com.example.trackingorder.common.OrderStatusEnum;
import com.example.trackingorder.config.basicauthconfig.AuthenticationFacade;
import com.example.trackingorder.configmapper.OrderMapper;
import com.example.trackingorder.dto.request.OrderSummaryItemReq;
import com.example.trackingorder.dto.request.OrderSummaryReq;
import com.example.trackingorder.dto.request.PlaceOrderReq;
import com.example.trackingorder.dto.response.*;
import com.example.trackingorder.entity.*;
import com.example.trackingorder.exception.BadRequestException;
import com.example.trackingorder.exception.NotFoundException;
import com.example.trackingorder.repository.*;
import com.example.trackingorder.service.CouponService;
import com.example.trackingorder.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {
    private final ProductVariantRepo productVariantRepo;
    private final CouponService couponService;
    private final AuthenticationFacade authenticationFacade;
    private final OrderRepo orderRepo;
    private final OrderItemRepo orderItemRepo;
    private final UserAddressRepo userAddressRepo;
    private final PaymentMethodRepo paymentMethodRepo;
    private final TrackingLogRepo trackingLogRepo;
    private final CartItemRepo cartItemRepo;
    private final InventoryRepo inventoryRepo;
    private final CartRepo cartRepo;
    private final OrderMapper orderMapper;

    // mapping quantity -> variants
    private Map<String, Integer> getQuantityMap(List<OrderSummaryItemReq> items) {

        Map<String, Integer> quantityMap = new HashMap<>();

        for (OrderSummaryItemReq item : items) {
            quantityMap.put(item.getProductVariantId(), item.getQuantity());
        }

        return quantityMap;
    }


    // loop variants
    private List<ProductVariant> loadProductVariants(List<OrderSummaryItemReq> items) {

        List<String> variantIds = new ArrayList<>();

        for (OrderSummaryItemReq item : items) {
            variantIds.add(item.getProductVariantId());
        }

        return productVariantRepo.findAllByIds(variantIds);
    }

    // check Inventory
    private void validateInventory(List<ProductVariant> productVariants,
                                   Map<String, Integer> quantityMap) {

        for (ProductVariant productVariant : productVariants) {

            Inventory inventory = productVariant.getInventory();

            if (inventory == null) {
                throw new NotFoundException(HttpStatus.NOT_FOUND, "Inventory Not Found");
            }

            Integer quantity = quantityMap.get(productVariant.getId());
            //quantityMap.get("A") => A: 2

            if (quantity > inventory.getQuantityInStock()) {
                throw new BadRequestException(
                        HttpStatus.BAD_REQUEST,
                        "Quantity In Stock Exceeded");
            }
        }
    }

    //tinh price, subtotal
    private BigDecimal calculateSubtotal(List<ProductVariant> productVariants,
                                         Map<String, Integer> quantityMap) {
        BigDecimal subtotal = BigDecimal.ZERO;

        for (ProductVariant productVariant : productVariants) {
            Integer quantity = quantityMap.get(productVariant.getId());

            // price = basic + modifier
            BigDecimal price = productVariant.getProduct().getBasePrice()
                    .add(productVariant.getPriceModifier());

            //item subtotal
            BigDecimal itemSubtotal = price.multiply(BigDecimal.valueOf(quantity));

            subtotal = subtotal.add(itemSubtotal);
        }

        log.info("Subtotal: {}", subtotal);

        return subtotal;
    }

    // create TrackingLog
    private void createTrackingLog(Order order,
                                   User updateBy,
                                   OrderStatusEnum fromStatus,
                                   OrderStatusEnum toStatus,
                                   String title,
                                   String note,
                                   String location) {

        TrackingLog trackingLog = new TrackingLog();

        trackingLog.setOrder(order);
        trackingLog.setUpdateBy(updateBy);
        trackingLog.setFromStatus(fromStatus == null ? null : fromStatus.name());
        trackingLog.setToStatus(toStatus.name());
        trackingLog.setTitle(title);
        trackingLog.setNote(note);
        trackingLog.setLocationDescription(location);

        trackingLogRepo.save(trackingLog);
    }


    @Override
    @Transactional(readOnly = true)
    public OrderSummaryRes getOrderSummary(OrderSummaryReq req) {

        // Mapping productVariantId -> quantity
        Map<String, Integer> quantityMap = getQuantityMap(req.getItems());

        // query 1 lan duy nhat
        List<ProductVariant> productVariants = loadProductVariants(req.getItems());

        // ktra ton kho
        validateInventory(productVariants, quantityMap);

        //subtoal
        BigDecimal subtotal = calculateSubtotal(productVariants, quantityMap);

        // Tính giảm giá từ coupon
        BigDecimal discountAmount = couponService.calculateCoupon(req.getCouponCode(), subtotal);
        log.info("Discount Amount: {}, Coupon: {}", discountAmount, req.getCouponCode());

        //Ship
        BigDecimal shipppingFee = BigDecimal.valueOf(30000);

        //grandTotal = subtotal - discountAmount + shippingFee
        BigDecimal grandTotal = subtotal
                .subtract(discountAmount)
                .add(shipppingFee);
        log.info("GrandTotal items: {}", grandTotal);


        return OrderSummaryRes.builder()
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .shippingFee(shipppingFee)
                .grandTotal(grandTotal)
                .build();
    }

    @Transactional
    @Override
    public PlaceOrderRes placeOrder(PlaceOrderReq req) {
        //get user login
        User user = authenticationFacade.getCurrentUser();

        // dam bao user dat hang bang address cua minh
        UserAddress address = userAddressRepo
                .findByIdAndUser(req.getAddressId(), user)
                .orElseThrow(() ->
                        new NotFoundException(HttpStatus.NOT_FOUND, "Address Not Found"));

        // Mapping productVariantId -> quantity
        Map<String, Integer> quantityMap = getQuantityMap(req.getItems());

        // Query product
        List<ProductVariant> productVariants =
                loadProductVariants(req.getItems());

        // validate inventory
        validateInventory(productVariants, quantityMap);

        // tinh subtotal
        BigDecimal subtotal = calculateSubtotal(productVariants, quantityMap);

        // coupon
        BigDecimal discountAmount = couponService.calculateCoupon(req.getCouponCode(), subtotal);

        // ship
        BigDecimal shippingFee = BigDecimal.valueOf(30000);


        //GrandTotal
        BigDecimal grandTotal = subtotal
                .subtract(discountAmount)
                .add(shippingFee);

        // Tao order
        Order order = new Order();

        order.setUser(user);
        order.setAddress(address);
        order.setStatus(OrderStatusEnum.PENDING);
        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setShippingFee(shippingFee);
        order.setGrandTotal(grandTotal);
        order.setPaymentType(req.getPaymentType());
        order.setTrackingNumber(UUID.randomUUID().toString());
        orderRepo.save(order);

        List<OrderItem> orderItems = new ArrayList<>();

        List<Inventory> inventories = new ArrayList<>();

        for (ProductVariant productVariant : productVariants) {

            // lay quantity
            Integer quantity = quantityMap.get(productVariant.getId());

            //price
            BigDecimal unitPrice = productVariant.getProduct().getBasePrice()
                    .add(productVariant.getPriceModifier());

            // orderItem
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductVariant(productVariant);
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(unitPrice);
            orderItems.add(orderItem);

            //inventory
            Inventory inventory = productVariant.getInventory();
            inventory.setQuantityInStock(inventory.getQuantityInStock() - quantity);
            inventories.add(inventory);

        }
        orderItemRepo.saveAll(orderItems);
        inventoryRepo.saveAll(inventories);

        // tang usedcount
        couponService.increaseUsedCount(req.getCouponCode());

        // xoa gio hang
        Cart cart = cartRepo.findByUser(user)
                .orElseThrow(() ->
                        new NotFoundException(HttpStatus.NOT_FOUND, "Cart Not Found"));

        List<CartItem> cartItems = cartItemRepo.findByCart(cart);

        cartItemRepo.deleteAll(cartItems);

//        // ghi lai tracking log
//        TrackingLog trackingLog = new TrackingLog();
//        trackingLog.setOrder(order);
//        trackingLog.setUpdateBy(user);
//        trackingLog.setFromStatus(null);
//        trackingLog.setToStatus(OrderStatusEnum.PENDING.name());
//        trackingLog.setTitle("Order Placed");
//        trackingLog.setNote("Customer placed the order successfully");
//        trackingLog.setLocationDescription("System");
//        trackingLog.setTimestamp(new Timestamp(System.currentTimeMillis()));
//
//        trackingLogRepo.save(trackingLog);

        createTrackingLog(
                order,
                user,
                null,
                OrderStatusEnum.PENDING,
                "Order Placed",
                "Customer placed the order successfully",
                "System"
        );

        return PlaceOrderRes.builder()
                .orderId(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .status(order.getStatus())
                .grandTotal(order.getGrandTotal())
                .message("Place order successfully")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MyOrderRes> getMyOrders() {

        User user = authenticationFacade.getCurrentUser();

        // lay toan bo don hang cua user
        List<Order> orders = orderRepo.findAllByUser(user);

        //Mapper
        return orderMapper.toMyOrderResList(orders);


    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailRes getOderDetail(String orderId) {
        User user = authenticationFacade.getCurrentUser();

        // Tim don hang cua user
        Order order = orderRepo.findOrderDetail(orderId, user)
                .orElseThrow(() ->
                        new NotFoundException(HttpStatus.NOT_FOUND, "Order Not Found"));

        return orderMapper.toOrderDetailRes(order);
    }

    @Override
    public ConfirmOrderRes confirmOrder(String orderId) {
        // Lấy admin đang đăng nhập
        User admin = authenticationFacade.getCurrentUser();

        // Tìm đơn hàng
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Order Not Found"));

        // Chỉ xác nhận đơn đang ở trạng thái PENDING
        if (order.getStatus() != OrderStatusEnum.PENDING) {
            throw new BadRequestException(
                    HttpStatus.BAD_REQUEST,
                    "Only pending orders can be confirmed");
        }

        // Lưu trạng thái cũ để ghi tracking log
        OrderStatusEnum oldStatus = order.getStatus();

        // Cập nhật trạng thái
        order.setStatus(OrderStatusEnum.CONFIRMED);

        // Lưu Order
        orderRepo.save(order);

        // Ghi lịch sử tracking
        createTrackingLog(
                order,
                admin,
                oldStatus,
                OrderStatusEnum.CONFIRMED,
                "Order Confirmed",
                "Warehouse confirmed the order.",
                "Warehouse"
        );

        return ConfirmOrderRes.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .message("Order confirmed successfully")
                .build();
    }

}

