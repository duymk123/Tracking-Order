package com.example.trackingorder.service.impl;

import com.example.trackingorder.client.FeatureFlagClient;
import com.example.trackingorder.common.OrderStatusEnum;
import com.example.trackingorder.config.basicauthconfig.AuthenticationFacade;
import com.example.trackingorder.configmapper.OrderMapper;
import com.example.trackingorder.configmapper.SellerOrderDetailMapper;
import com.example.trackingorder.configmapper.SellerOrderMapper;
import com.example.trackingorder.configmapper.TrackingLogMapper;
import com.example.trackingorder.dto.request.*;
import com.example.trackingorder.dto.response.*;
import com.example.trackingorder.entity.*;
import com.example.trackingorder.exception.BadRequestException;
import com.example.trackingorder.exception.ForbiddenException;
import com.example.trackingorder.exception.NotFoundException;
import com.example.trackingorder.repository.*;
import com.example.trackingorder.service.CouponService;
import com.example.trackingorder.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
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
    private final TrackingLogRepo trackingLogRepo;
    private final CartItemRepo cartItemRepo;
    private final InventoryRepo inventoryRepo;
    private final CartRepo cartRepo;
    private final OrderMapper orderMapper;
    private final SellerOrderMapper sellerOrderMapper;
    private final SellerOrderDetailMapper sellerOrderDetailMapper;
    private final TrackingLogMapper trackingLogMapper;
    private final CarrierRepo carrierRepo;
    private final ShipperRepo shipperRepo;
    private final FeatureFlagClient featureFlagClient;

    // mapping quantity -> variants
    private Map<String, Integer> getQuantityMap(List<OrderSummaryItemReq> items) {

        Map<String, Integer> quantityMap = new HashMap<>();

        for (OrderSummaryItemReq item : items) {

            //fix lỗi variant bị trùng trong request A:2, A:5 -> A :5
            if (quantityMap.containsKey(item.getProductVariantId())) {
                throw new BadRequestException(HttpStatus.BAD_REQUEST, "Duplicate product variant id " + item.getProductVariantId());
            }

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

    // Kiểm tra variant tồn tại
    private void validateProductVariantsExist(List<ProductVariant> productVariants,
                                              Map<String, Integer> quantityMap) {
        if (productVariants.size() != quantityMap.size()) {
            throw new NotFoundException(
                    HttpStatus.NOT_FOUND,
                    "One or more product variants do not exist"
            );
        }
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

            log.info("PRICE_INCREASE flag active: {}", featureFlagClient.isEnabled("PRICE_INCREASE"));
            if(featureFlagClient.isEnabled("PRICE_INCREASE")) {
                price = price.multiply(BigDecimal.valueOf(1.10));
            }

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
        trackingLog.setTimestamp(new Timestamp(System.currentTimeMillis()));

        trackingLogRepo.save(trackingLog);
    }

    // cập nhật trạng thái đơn hàng
    private void updateOrderStatus(
            Order order,
            User updatedBy,
            OrderStatusEnum expectedStatus,
            OrderStatusEnum newStatus,
            String title,
            String note,
            String location) {

        // Validate trạng thái
        if (order.getStatus() != expectedStatus) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, String.format("Only %s orders can be changed to %s", expectedStatus, newStatus));
        }

        //Lưu trạng thái cũ
        OrderStatusEnum oldStatus = order.getStatus();

        //Update status
        order.setStatus(newStatus);

        createTrackingLog(
                order,
                updatedBy,
                oldStatus,
                newStatus,
                title,
                note,
                location
        );
    }


    @Override
    @Transactional(readOnly = true)
    public OrderSummaryRes getOrderSummary(OrderSummaryReq req) {

        // Mapping productVariantId -> quantity
        Map<String, Integer> quantityMap = getQuantityMap(req.getItems());

        // query 1 lan duy nhat
        List<ProductVariant> productVariants = loadProductVariants(req.getItems());

        // vlidate variants
        validateProductVariantsExist(productVariants, quantityMap);


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

    @Transactional(rollbackFor = Exception.class)
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

        //validate variants
        validateProductVariantsExist(productVariants, quantityMap);

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

            // Áp dụng PRICE_INCREASE flag (đồng bộ với calculateSubtotal)
            if (featureFlagClient.isEnabled("PRICE_INCREASE")) {
                unitPrice = unitPrice.multiply(BigDecimal.valueOf(1.10));
            }

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
    public BuyNowRes buyNow(BuyNowReq req) {
        // Check Feature Flag trước khi xử lí
        if (!featureFlagClient.isEnabled("BUY_NOW")) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, "Tính năng đang bảo trì");
        }


        ProductVariant productVariant = productVariantRepo.findById(req.getProductVariantId())
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Product Variant not found"));

        Inventory inventory = inventoryRepo.findByProductVariant(productVariant)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Inventory not found"));

        if (req.getQuantity() > inventory.getQuantityInStock()) {
            throw new BadRequestException(
                    HttpStatus.BAD_REQUEST,
                    "Not enough stock");
        }

        return BuyNowRes.builder()
                .productVariantId(productVariant.getId())
                .quantity(req.getQuantity())
                .message("Buy Now initialized successfully")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailRes getOrderDetail(String orderId) {
        // check cờ
        if(!featureFlagClient.isEnabled("ORDER_DETAIL")) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, "Tính năng đang bảo trì");
        }

        User user = authenticationFacade.getCurrentUser();


        // Tim don hang cua user
        Order order = orderRepo.findOrderDetail(orderId, user)
                .orElseThrow(() ->
                        new NotFoundException(HttpStatus.NOT_FOUND, "Order Not Found"));

        return orderMapper.toOrderDetailRes(order);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ConfirmOrderRes confirmOrder(String orderId) {
        // Lấy seller đang đăng nhập
        User seller = authenticationFacade.getCurrentUser();

        // Tìm đơn hàng
        Order order = orderRepo.findOrderDetail(orderId)
                .orElseThrow(() ->
                        new NotFoundException(HttpStatus.NOT_FOUND, "Order Not Found"));

        boolean hasPermission = order.getOrderItems()
                .stream()
                .anyMatch(item ->
                        item.getProductVariant()
                                .getProduct()
                                .getSeller()
                                .getId()
                                .equals(seller.getId()));

        if (!hasPermission) {
            throw new ForbiddenException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to confirm this order");
        }

        updateOrderStatus(
                order,
                seller,
                OrderStatusEnum.PENDING,
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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PickingOrderRes pickingOrder(String orderId) {
        // Lấy seller đang đăng nhập
        User seller = authenticationFacade.getCurrentUser();

        // Tìm đơn hàng
        Order order = orderRepo.findOrderDetail(orderId)
                .orElseThrow(() ->
                        new NotFoundException(HttpStatus.NOT_FOUND, "Order Not Found"));

        boolean hasPermission = order.getOrderItems()
                .stream()
                .anyMatch(item ->
                        item.getProductVariant()
                                .getProduct()
                                .getSeller()
                                .getId()
                                .equals(seller.getId()));

        if (!hasPermission) {
            throw new ForbiddenException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to confirm this order");
        }


        updateOrderStatus(
                order,
                seller,
                OrderStatusEnum.CONFIRMED,
                OrderStatusEnum.PICKING,
                "Picking Order",
                "Warehouse is preparing the package.",
                "Warehouse"
        );

        return PickingOrderRes.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .message("Order is being prepared")
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ShippingOrderRes shippingOrder(String orderId) {
        // User login
        User user = authenticationFacade.getCurrentUser();

        // Lấy shipper
        Shipper shipper = shipperRepo.findByUser(user)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Shipper not found"));

        // Lấy Order
        Order order = orderRepo.findOrderDetail(orderId)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Order not found"));

        // Check quyền
        if (order.getShipper() == null || !order.getShipper().getId().equals(shipper.getId())) {
            throw new ForbiddenException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to update this order");
        }

        // Check status
        if (order.getStatus() != OrderStatusEnum.PICKING
                && order.getStatus() != OrderStatusEnum.REATTEMPT) {
            throw new BadRequestException(
                    HttpStatus.BAD_REQUEST,
                    "Only PICKING or REATTEMPT orders can be shipped");
        }

        OrderStatusEnum oldStatus = order.getStatus();

        order.setStatus(OrderStatusEnum.SHIPPING);

        orderRepo.save(order);

        // Tracking log
        createTrackingLog(
                order,
                user,
                oldStatus,
                OrderStatusEnum.SHIPPING,
                "Package Shipped",
                "Package has been picked up by shipper.",
                "Warehouse"
        );

        return ShippingOrderRes.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .message("Order shipped successfully")
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public DeliveredOrderRes deliveredOrder(String orderId) {
        // Lấy shipper đang đăng nhập
        User shipperUser = authenticationFacade.getCurrentUser();

        // Tìm shipper
        Shipper shipper = shipperRepo.findByUser(shipperUser)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Shipper not found"));

        // Tìm đơn hàng
        Order order = orderRepo.findOrderDetail(orderId)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Order not found"));

        // Check quyền
        if (order.getShipper() == null || !order.getShipper().getId().equals(shipper.getId())) {
            throw new ForbiddenException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to update this order");
        }

        updateOrderStatus(
                order,
                shipperUser,
                OrderStatusEnum.SHIPPING,
                OrderStatusEnum.DELIVERED,
                "Delivered",
                "Package delivered successfully.",
                "Customer Address"
        );

        return DeliveredOrderRes.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .message("Order delivered successfully")
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FailedOrderRes failedOrder(String orderId) {
        // Lấy shipper đang đăng nhập
        User shipperUser = authenticationFacade.getCurrentUser();

        // Tìm shipper
        Shipper shipper = shipperRepo.findByUser(shipperUser)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Shipper not found"));

        // Tìm đơn hàng
        Order order = orderRepo.findOrderDetail(orderId)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Order not found"));

        // Check quyền
        if (order.getShipper() == null
                || !order.getShipper().getId().equals(shipper.getId())) {

            throw new ForbiddenException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to update this order");
        }

        updateOrderStatus(
                order,
                shipperUser,
                OrderStatusEnum.SHIPPING,
                OrderStatusEnum.FAILED,
                "Delivery Failed",
                "Delivery attempt failed.",
                "Customer Address"
        );

        return FailedOrderRes.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .message("Delivery failed")
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ReturningOrderRes returningOrder(String orderId) {
        // Lấy shipper đang đăng nhập
        User shipperUser = authenticationFacade.getCurrentUser();

        // Tìm shipper
        Shipper shipper = shipperRepo.findByUser(shipperUser)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Shipper not found"));

        // Tìm đơn hàng
        Order order = orderRepo.findOrderDetail(orderId)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Order not found"));

        // Check quyền
        if (order.getShipper() == null
                || !order.getShipper().getId().equals(shipper.getId())) {

            throw new ForbiddenException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to update this order");
        }

        updateOrderStatus(
                order,
                shipperUser,
                OrderStatusEnum.FAILED,
                OrderStatusEnum.RETURNING,
                "Returning",
                "Package is returning to warehouse.",
                "Warehouse"
        );

        return ReturningOrderRes.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .message("Order returned successfully")
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ReattemptOrderRes reattemptOrder(String orderId) {
        // Lấy shipper đang đăng nhập
        User shipperUser = authenticationFacade.getCurrentUser();

        // Tìm shipper
        Shipper shipper = shipperRepo.findByUser(shipperUser)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Shipper not found"));

        // Tìm đơn hàng
        Order order = orderRepo.findOrderDetail(orderId)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Order not found"));

        // Check quyền
        if (order.getShipper() == null
                || !order.getShipper().getId().equals(shipper.getId())) {

            throw new ForbiddenException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to update this order");
        }

        updateOrderStatus(
                order,
                shipperUser,
                OrderStatusEnum.FAILED,
                OrderStatusEnum.REATTEMPT,
                "Delivery Reattempt",
                "Delivery has been rescheduled.",
                "Delivery Hub"
        );

        return ReattemptOrderRes.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .message("Delivery reattempt scheduled")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SellerOrderRes> getSellerOrders(Integer pageSize, Integer pageNumber) {
        User seller = authenticationFacade.getCurrentUser();

        Pageable pageable = PageRequest.of(
                pageNumber - 1,
                pageSize,
                Sort.by("createdAt").descending()
        );

        Page<Order> orders = orderRepo.findAll(pageable);
        log.info("Getting SellerOrders for {} Orders", orders.getTotalElements());

        if (orders.isEmpty()) {
            log.info("No orders found");
            return Page.empty(pageable);
        }
        return orders.map(sellerOrderMapper::toSellerOrderRes);
    }

    @Override
    @Transactional(readOnly = true)
    public SellerOrderDetailRes getSellerOrderDetail(String orderId) {
        User seller = authenticationFacade.getCurrentUser();

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() ->
                        new NotFoundException(HttpStatus.NOT_FOUND, "Order Not Found"));

        // tracking log
        List<TrackingLog> trackingLogs = trackingLogRepo.findByOrderId(order.getId());

        // mapping
        SellerOrderDetailRes sellerOrderDetailRes = sellerOrderDetailMapper.toSellerOrderDetailRes(order);

        //set tracking log
        sellerOrderDetailRes.setTrackingLogs(trackingLogMapper.toTrackingHistoryResList(trackingLogs));

        return sellerOrderDetailRes;
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public AssignDeliveryRes assignDelivery(String orderId, AssignDeliveryReq req) {
        // Seller đăng nhập
        User seller = authenticationFacade.getCurrentUser();

        //Tìm Order
        Order order = orderRepo.findOrderDetail(orderId)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Order not found"));

        // Check quyền Seller
        boolean hasPermission = order.getOrderItems()
                .stream()
                .anyMatch(item ->
                        item.getProductVariant()
                                .getProduct()
                                .getSeller()
                                .getId()
                                .equals(seller.getId()));

        if (!hasPermission) {
            throw new ForbiddenException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to assign delivery");
        }

        //Chỉ assign khi đang PICKING
        if (order.getStatus() != OrderStatusEnum.PICKING) {
            throw new BadRequestException(
                    HttpStatus.BAD_REQUEST,
                    "Only PICKING orders can assign delivery");
        }

        // Carrier
        Carrier carrier = carrierRepo.findById(req.getCarrierId())
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Carrier not found"));

        if (!carrier.isActive()) {
            throw new BadRequestException(
                    HttpStatus.BAD_REQUEST,
                    "Carrier is inactive");
        }

        // check xem đã assign chưa
        if (order.getCarrier() != null || order.getShipper() != null) {
            throw new BadRequestException(
                    HttpStatus.BAD_REQUEST,
                    "Delivery has already been assigned");
        }
        // Shipper
        Shipper shipper = shipperRepo.findById(req.getShipperId())
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Shipper not found"));

        //  Check shipper thuộc carrier
        if (!shipper.getCarrier().getId().equals(carrier.getId())) {
            throw new BadRequestException(
                    HttpStatus.BAD_REQUEST,
                    "Shipper does not belong to selected carrier");
        }

        //tracking number
        String trackingNumber =
                carrier.getName()
                        .replace(" ", "")
                        .toUpperCase()
                        + "-"
                        + System.currentTimeMillis();

        //  Estimated delivery
        Date estimatedDelivery = new Date(System.currentTimeMillis() + 3L * 24 * 60 * 60 * 1000);

        //  Update order
        order.setCarrier(carrier);
        order.setShipper(shipper);
        order.setTrackingNumber(trackingNumber);
        order.setEstimatedDeliveryDate(estimatedDelivery);

        orderRepo.save(order);

        // Tracking Log
        createTrackingLog(
                order,
                seller,
                OrderStatusEnum.PICKING,
                OrderStatusEnum.PICKING,
                "Delivery Assigned",
                "Carrier " + carrier.getName()
                        + " and Shipper "
                        + shipper.getUser().getUsername()
                        + " assigned.",
                "Warehouse"
        );


        return AssignDeliveryRes.builder()
                .orderId(order.getId())
                .carrierName(carrier.getName())
                .shipperName(shipper.getUser().getUsername())
                .trackingNumber(order.getTrackingNumber())
                .estimatedDeliveryDate(order.getEstimatedDeliveryDate())
                .message("Delivery assigned successfully")
                .build();
    }

    @Override
    public Page<SellerOrderRes> getShipperOrders(Integer pageSize, Integer pageNumber) {

        // User login
        User user = authenticationFacade.getCurrentUser();

        // shipper
        Shipper shipper = shipperRepo.findByUser(user)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Shipper not found"));


        Pageable pageable = PageRequest.of(
                pageNumber - 1,
                pageSize,
                Sort.by("createdAt").descending());

        Page<Order> orders = orderRepo.findByShipper(shipper, pageable);

        log.info("Shipper {} has {} orders",
                user.getUsername(),
                orders.getTotalElements());

        if (orders.isEmpty()) {
            return Page.empty(pageable);
        }

        return orders.map(sellerOrderMapper::toSellerOrderRes);
    }

    @Override
    public SellerOrderDetailRes getShipperOrderDetail(String orderId) {
        User user = authenticationFacade.getCurrentUser();

        Shipper shipper = shipperRepo.findByUser(user)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Shipper not found"));

        Order order = orderRepo.findOrderDetail(orderId)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Order not found"));

        // Check quyền
        if (order.getShipper() == null || !order.getShipper().getId().equals(shipper.getId())) {

            throw new ForbiddenException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to view this order");
        }

        List<TrackingLog> trackingLogs = trackingLogRepo.findByOrderId(order.getId());

        SellerOrderDetailRes sellerOrderDetailRes = sellerOrderDetailMapper.toSellerOrderDetailRes(order);

        sellerOrderDetailRes.setTrackingLogs(trackingLogMapper.toTrackingHistoryResList(trackingLogs));

        return sellerOrderDetailRes;
    }


}



