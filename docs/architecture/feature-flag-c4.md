# Tài Liệu Kiến Trúc C4 - Hệ Thống Feature Flag

Hệ thống Feature Flag được thiết kế theo kiến trúc **Local Snapshot & Push Model (Không gọi chéo runtime)**, cho phép các ứng dụng nghiệp vụ (như `tracking-order`) kiểm tra cờ tính năng với độ trễ xấp xỉ **0ms**, độc lập với Feature Flag Service khi runtime.

---

## 1. System Context Diagram (Level 1 - C4Context)

Mô tả bức tranh tổng thể về các tác nhân (Actors) và các hệ thống lớn trong toàn bộ giải pháp.

```mermaid
C4Context
  title System Context diagram for Feature Flag & E-Commerce Ecosystem

  Person(admin, "Super Admin", "Quản trị viên hệ thống, quản lý danh mục cờ toàn cục và cấp quyền (Grant) cho từng Tenant/Khách hàng")
  Person(buyer, "Khách hàng (Buyer)", "Người mua hàng trên giao diện Storefront, sử dụng các tính năng như Mua Ngay, Xem Chi Tiết Đơn Hàng")

  System_Boundary(ecosystem, "Hệ Thống Feature Flag & E-Commerce") {
    System(adminSystem, "Admin Feature Flag Service", "Hệ thống trung tâm (Control Plane) quản lý đối tác (Tenants), danh mục cờ (Master Features) và kích hoạt đồng bộ")
    System(tenantFlagSystem, "Tenant Feature Flag Service", "Hệ thống đánh giá cờ cho từng cụm Tenant, quản lý các chiến lược rollout (IP, % rollout, thời gian)")
    System(trackingOrderSystem, "Tracking Order System", "Ứng dụng nghiệp vụ thương mại điện tử & theo dõi đơn hàng, thực thi bật/tắt tính năng theo cờ cục bộ")
  }

  Rel(admin, adminSystem, "Quản lý Tenant, Master Flag & Cấp quyền", "HTTPS/Web UI")
  Rel(buyer, trackingOrderSystem, "Đặt hàng, xem chi tiết đơn hàng", "HTTPS/Storefront")
  Rel(adminSystem, tenantFlagSystem, "Đồng bộ cờ được cấp (Grant) & kích hoạt Apply", "HTTP/REST")
  Rel(tenantFlagSystem, trackingOrderSystem, "Đẩy snapshot cờ tính năng (Push Model)", "HTTP/REST (X-Internal-Token)")
```

---

## 2. Container Diagram (Level 2 - C4Container)

Mô tả chi tiết các ứng dụng (Containers), cơ sở dữ liệu và giao thức kết nối giữa các phân hệ theo mô hình Docker Compose đa phân hệ.

```mermaid
C4Container
  title Container Diagram for Feature Flag Architecture

  Person(admin, "Super Admin", "Quản trị viên")
  Person(buyer, "Buyer", "Khách hàng mua sắm")

  System_Boundary(adminPlane, "1. Central Control Plane (Admin)") {
    Container(adminUi, "Admin Portal UI", "React, Vite, CSS", "Giao diện quản lý danh sách Tenant, Master Feature và cấp quyền")
    Container(adminApi, "Admin Backend Service", "Spring Boot 4, Java 21", "Cung cấp API quản lý Tenant, Master Features và điều phối sync")
    ContainerDb(adminDb, "Admin Database", "MySQL 8.0", "Lưu trữ bảng tenants, master_features, tenant_feature_grants")
  }

  System_Boundary(tenantPlane, "2. Tenant Feature Flag Plane (Instance)") {
    Container(tenantFlagApi, "Feature Flag Service", "Spring Boot 4, Java 21", "Đánh giá chiến lược cờ (Strategy Engine) và đóng gói snapshot")
    ContainerDb(tenantFlagDb, "Feature Flag DB", "MySQL 8.0", "Lưu trữ feature_flags, strategies, audit_logs")
  }

  System_Boundary(appPlane, "3. Business Application Plane (Tracking Order)") {
    Container(storefrontUi, "Storefront Web App", "React, Vite, TailwindCSS", "Giao diện người dùng mua sắm và theo dõi hành trình đơn hàng")
    Container(orderApi, "Tracking Order Service", "Spring Boot 4, AspectJ, JPA", "Xử lý đơn hàng, kiểm tra cờ cục bộ qua Spring AOP (@RequireFeature)")
    ContainerDb(orderDb, "Tracking Order DB", "MySQL 8.0", "Lưu trữ orders, inventory và bảng feature_flag_configs (local snapshot)")
  }

  Rel(admin, adminUi, "Truy cập quản trị", "HTTPS")
  Rel(adminUi, adminApi, "Gọi API quản lý", "JSON/REST")
  Rel(adminApi, adminDb, "Đọc/ghi dữ liệu", "JDBC")

  Rel(adminApi, tenantFlagApi, "Cấp cờ & Kích hoạt Apply (/api/v1/flags/apply)", "JSON/HTTP")
  Rel(tenantFlagApi, tenantFlagDb, "Đọc cấu hình cờ & chiến lược", "JDBC")

  Rel(tenantFlagApi, orderApi, "Đẩy bản snapshot cờ (/api/v1/feature-flags/sync)", "JSON/HTTP (X-Internal-Token)")
  Rel(orderApi, orderDb, "Lưu & truy vấn snapshot cờ cục bộ", "JDBC")

  Rel(buyer, storefrontUi, "Duyệt web, mua hàng", "HTTPS")
  Rel(storefrontUi, orderApi, "Gửi request mua hàng / xem đơn hàng", "JSON/REST")
```

---

## 3. Component Diagram (Level 3 - C4Component)

Đi sâu vào cấu trúc bên trong của Container **Tracking Order Service**, minh họa cách Spring AOP, Custom Annotation và Local Snapshot phối hợp để kiểm tra cờ mà **không cần gọi ra ngoài mạng**.

```mermaid
C4Component
  title Component Diagram - Feature Flag Checking in Tracking Order Service

  Container_Ext(tenantFlagService, "Tenant Feature Flag Service", "Spring Boot", "Đẩy snapshot cờ tính năng")
  ContainerDb(orderDb, "Tracking Order DB", "MySQL 8.0", "Bảng feature_flag_configs")
  Container_Ext(storefront, "Storefront UI", "React", "Gửi request nghiệp vụ")

  Container_Boundary(trackingApp, "Tracking Order Backend (Spring Boot)") {
    Component(syncCtrl, "InternalFeatureFlagController", "Spring MVC RestController", "Endpoint nội bộ /api/v1/feature-flags/sync nhận snapshot cờ")
    Component(orderCtrl, "OrderController", "Spring MVC RestController", "Endpoint công khai phục vụ mua sắm: /buy-now, /{orderId}")
    
    Component(aspect, "FeatureFlagAspect", "Spring AspectJ (@Aspect)", "Chặn các method có gắn @RequireFeature trước khi thực thi")
    Component(annotation, "@RequireFeature", "Java Custom Annotation", "Đánh dấu danh sách cờ cần thiết: @RequireFeature({'BUY_NOW'})")
    
    Component(client, "FeatureFlagClient", "Spring Component (Facade)", "Cung cấp hàm tiện ích isEnabled(flagName) và evaluateAll()")
    Component(configService, "FeatureFlagConfigServiceImpl", "Spring Service", "Đánh giá cờ theo IP Whitelist, Tenant Rule và Strategy Logic (AND/OR)")
    Component(repo, "FeatureFlagConfigRepo", "Spring Data JPA Repository", "Truy vấn bảng feature_flag_configs")

    Component(orderService, "OrderServiceImpl", "Spring Service", "Xử lý logic nghiệp vụ tạo đơn, chi tiết đơn")
  }

  Rel(tenantFlagService, syncCtrl, "1. Đẩy snapshot mới", "POST /api/v1/feature-flags/sync")
  Rel(syncCtrl, configService, "2. Ghi đè snapshot (syncSnapshot)", "Java call")
  Rel(configService, repo, "3. deleteAllInBatch() & saveAll()", "JPA")
  Rel(repo, orderDb, "4. Ghi snapshot vào DB", "SQL")

  Rel(storefront, orderCtrl, "5. Gọi API GET /orders/{id}", "JSON/HTTP")
  Rel(orderCtrl, orderService, "6. Gọi getOrderDetail(id)", "Java Interface")
  
  Rel(aspect, annotation, "Chặn method được gắn", "Pointcut @annotation")
  Rel(aspect, orderService, "Chặn trước khi thực thi (@Before)", "AOP Proxy")
  Rel(aspect, client, "7. Gọi isEnabled('ORDER_DETAIL')", "Java call")
  Rel(client, configService, "8. Đánh giá cờ", "Java call")
  Rel(configService, repo, "9. Lấy cấu hình cờ cục bộ", "JPA/Cache")
  Rel(repo, orderDb, "10. Truy vấn cờ từ DB cục bộ", "SQL")
```

---

## 4. Dynamic Diagram (Level 4 - C4Dynamic)

Minh họa luồng hoạt động đồng bộ và thực thi thực tế (Request Flow) từ lúc Admin bật cờ đến lúc người dùng sử dụng tính năng.

### Luồng 1: Admin cập nhật cờ và đồng bộ sang Tracking Order
```mermaid
C4Dynamic
  title Dynamic Diagram - Cập Nhật Cờ và Đồng Bộ (Push Model)

  Container(adminUi, "Admin UI", "React", "Giao diện quản trị")
  Container(adminService, "Admin Service", "Spring Boot", "Control Plane")
  Container(flagService, "Feature Flag Service", "Spring Boot", "Tenant Engine")
  Container(orderService, "Tracking Order", "Spring Boot", "Client Service")
  ContainerDb(orderDb, "Tracking Order DB", "MySQL", "Cơ sở dữ liệu cục bộ")

  Rel(adminUi, adminService, "1. Gạt bật cờ & nhấn Apply", "POST /api/v1/admin/sync/apply/{tenantCode}")
  Rel(adminService, flagService, "2. Gọi lệnh apply sang Instance của Tenant", "POST /api/v1/flags/apply")
  Rel(flagService, flagService, "3. Đóng gói danh sách cờ đã cấp (isGranted=true)", "Internal packaging")
  Rel(flagService, orderService, "4. Gửi HTTP POST kèm snapshot & token bí mật", "POST /api/v1/feature-flags/sync (X-Internal-Token)")
  Rel(orderService, orderDb, "5. Cập nhật bảng feature_flag_configs", "SQL deleteAll & saveAll")
```

### Luồng 2: Buyer gọi API và Spring AOP kiểm tra cờ cục bộ
```mermaid
C4Dynamic
  title Dynamic Diagram - Kiểm Tra Cờ Qua Spring AOP Khi Khách Hàng Gọi API

  Container(browser, "Trình duyệt Khách hàng", "Storefront UI", "Web Browser")
  Component(orderCtrl, "OrderController", "Spring MVC", "Tiếp nhận HTTP request")
  Component(aspect, "FeatureFlagAspect", "Spring AOP", "Kiểm tra quyền cờ")
  Component(client, "FeatureFlagClient", "Spring Component", "Facade đọc snapshot")
  ContainerDb(orderDb, "Tracking Order DB", "MySQL", "Snapshot cục bộ")
  Component(orderService, "OrderServiceImpl", "Spring Service", "Logic nghiệp vụ")

  Rel(browser, orderCtrl, "1. Gửi request GET /api/v1/orders/123", "HTTPS/JSON")
  Rel(orderCtrl, aspect, "2. Gọi orderService.getOrderDetail() -> AOP chặn lại", "Spring Proxy")
  Rel(aspect, client, "3. Gọi client.isEnabled('ORDER_DETAIL')", "Java Method Call")
  Rel(client, orderDb, "4. Kiểm tra snapshot cờ trong DB cục bộ", "SQL (~0ms)")
  Rel(aspect, orderService, "5a. Nếu ENABLED: Cho phép tiếp tục thực thi nghiệp vụ", "Proceed")
  Rel(aspect, browser, "5b. Nếu DISABLED: Ném BadRequestException('Tính năng đang bảo trì')", "HTTP 400")
```

---

## 5. Deployment Diagram (Level 5 - C4Deployment)

Mô hình triển khai thực tế trên môi trường Docker theo file `docker-compose.yml`:

```mermaid
C4Deployment
  title Deployment Diagram - Docker Compose Architecture

  Deployment_Node(host, "Máy Chủ Triển Khai (Host)", "Docker Engine") {
    Deployment_Node(network, "viettel-network", "Docker Bridge Network") {
      
      Deployment_Node(adminGroup, "Cụm Quản Trị Trung Tâm", "Docker Containers") {
        ContainerDb(adminDbNode, "admin-feature-flag-db", "MySQL 8.0:33064", "Database quản trị")
        Container(adminServiceNode, "admin-feature-flag-service", "Spring Boot:8084", "Control Plane Service")
      }

      Deployment_Node(instanceA, "Cụm Instance A (Tenant A)", "Docker Containers") {
        ContainerDb(flagDbA, "feature-flag-service-a-db", "MySQL:33061", "Flag DB A")
        Container(flagServiceA, "feature-flag-service-a", "Spring Boot:8081", "Flag Service A")
        ContainerDb(orderDbA, "tracking-order-db-a", "MySQL:33062", "Order DB A")
        Container(orderServiceA, "tracking-order-a", "Spring Boot:8082", "Tracking Order A")
      }

      Deployment_Node(instanceB, "Cụm Instance B (Tenant B)", "Docker Containers") {
        ContainerDb(flagDbB, "feature-flag-service-b-db", "MySQL:33065", "Flag DB B")
        Container(flagServiceB, "feature-flag-service-b", "Spring Boot:8085", "Flag Service B")
        ContainerDb(orderDbB, "tracking-order-db-b", "MySQL:33063", "Order DB B")
        Container(orderServiceB, "tracking-order-b", "Spring Boot:8083", "Tracking Order B")
      }
    }
  }

  Rel(adminServiceNode, adminDbNode, "Kết nối", "Port 3306")
  Rel(adminServiceNode, flagServiceA, "Sync / Apply", "Port 8081")
  Rel(adminServiceNode, flagServiceB, "Sync / Apply", "Port 8081")

  Rel(flagServiceA, flagDbA, "Kết nối", "Port 3306")
  Rel(flagServiceA, orderServiceA, "Đẩy snapshot cờ", "Port 8080")
  Rel(orderServiceA, orderDbA, "Đọc/ghi đơn hàng & snapshot", "Port 3306")

  Rel(flagServiceB, flagDbB, "Kết nối", "Port 3306")
  Rel(flagServiceB, orderServiceB, "Đẩy snapshot cờ", "Port 8080")
  Rel(orderServiceB, orderDbB, "Đọc/ghi đơn hàng & snapshot", "Port 3306")
```

---

## 6. Điểm Nổi Bật Về Mặt Kiến Trúc (Architecture Highlights)

1. **Zero-Latency In-Memory Evaluation**:
   * Khi người dùng gọi API nghiệp vụ (ví dụ mua hàng `buyNow`), ứng dụng `tracking-order` **hoàn toàn không gọi bất kỳ HTTP request nào** sang `feature-flag-service`.
   * Cờ được đọc trực tiếp từ bảng snapshot cục bộ `feature_flag_configs` trong cùng cơ sở dữ liệu.
2. **Clean Separation of Concerns với Spring AOP**:
   * Code nghiệp vụ sạch sẽ, hoàn toàn tách biệt việc kiểm tra cờ khỏi code xử lý kinh doanh nhờ Custom Annotation `@RequireFeature` và `FeatureFlagAspect`.
3. **Multi-Tenancy Isolation (Cô Lập Khách Hàng)**:
   * Mỗi Tenant (Instance A, Instance B) sở hữu cơ sở dữ liệu và container riêng biệt, đảm bảo tính bảo mật và độc lập khi vận hành.
4. **Bảo Mật Push Model**:
   * Giao tiếp giữa `feature-flag-service` và `tracking-order` được bảo vệ bằng header bí mật `X-Internal-Token`.
