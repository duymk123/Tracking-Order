# Tài Liệu Kiến Trúc C4 - Hệ Thống Feature Flag

Hệ thống Feature Flag được thiết kế theo kiến trúc **Local Snapshot, File-Based Streaming & Air-Gapped Import (Không gọi chéo runtime)**. Giải pháp cho phép ứng dụng nghiệp vụ (`tracking-order`) kiểm tra cờ tính năng với độ trễ xấp xỉ **0ms**, đồng thời giải quyết triệt để bài toán **dữ liệu phình to khi tổ chức có hàng nghìn user** bằng cơ chế đồng bộ dạng file (File-based Sync & Export/Import).

---

## 1. System Context Diagram (Level 1 - C4Context)

Mô tả bức tranh tổng thể về các tác nhân (Actors) và các hệ thống lớn trong toàn bộ giải pháp, thể hiện cả luồng đồng bộ tự động qua file và luồng xuất/nhập file thủ công.

```mermaid
C4Context
  title System Context diagram for Feature Flag & E-Commerce Ecosystem

  Person(admin, "Super Admin / Ops", "Quản trị viên hệ thống, quản lý cờ toàn cục, xuất file cấu hình và nhập file snapshot sang Tracking Order")
  Person(buyer, "Khách hàng (Buyer)", "Người mua hàng trên giao diện Storefront, sử dụng các tính năng như Mua Ngay, Xem Chi Tiết Đơn Hàng")

  System_Boundary(ecosystem, "Hệ Thống Feature Flag & E-Commerce") {
    System(adminSystem, "Admin Feature Flag Service", "Hệ thống trung tâm (Control Plane) quản lý đối tác (Tenants), danh mục cờ (Master Features) và cấp quyền")
    System(tenantFlagSystem, "Tenant Feature Flag Service", "Hệ thống đánh giá cờ cho từng cụm Tenant, hỗ trợ xuất file cấu hình (Export) và đóng gói file snapshot")
    System(trackingOrderSystem, "Tracking Order System", "Ứng dụng thương mại điện tử & theo dõi đơn hàng, tiếp nhận file snapshot (Online/Offline) và thực thi cờ cục bộ")
  }

  Rel(admin, adminSystem, "Quản lý Tenant, Master Flag & Cấp quyền", "HTTPS/Web UI")
  Rel(admin, tenantFlagSystem, "Cấu hình rule, xuất file cấu hình (Export)", "HTTPS/Web UI")
  Rel(admin, trackingOrderSystem, "Nạp file cấu hình (Import Snapshot)", "HTTPS/Admin UI")
  Rel(buyer, trackingOrderSystem, "Đặt hàng, xem chi tiết đơn hàng", "HTTPS/Storefront")

  Rel(adminSystem, tenantFlagSystem, "Đồng bộ cờ được cấp (Grant)", "HTTP/REST")
  Rel(tenantFlagSystem, trackingOrderSystem, "Đẩy file snapshot cờ tính năng (Push File/Stream)", "HTTP Multipart (X-Internal-Token)")
```

---

## 2. Container Diagram (Level 2 - C4Container)

Mô tả chi tiết các ứng dụng (Containers), cơ sở dữ liệu và giao thức kết nối. Kiến trúc hỗ trợ cả 2 hình thức đồng bộ file:
1. **Online File Sync**: Gửi file snapshot qua HTTP Multipart/Stream giữa 2 service.
2. **Offline File Sync**: Xuất file (`.json`) từ Flag Service mang sang nhập vào Admin Tracking Order.

```mermaid
C4Container
  title Container Diagram for Feature Flag Architecture

  Person(admin, "Super Admin / Ops", "Quản trị viên")
  Person(buyer, "Buyer", "Khách hàng mua sắm")

  System_Boundary(adminPlane, "1. Central Control Plane (Admin)") {
    Container(adminUi, "Admin Portal UI", "React, Vite, CSS", "Giao diện quản lý danh sách Tenant, Master Feature và cấp quyền")
    Container(adminApi, "Admin Backend Service", "Spring Boot 4, Java 21", "Cung cấp API quản lý Tenant, Master Features và điều phối cờ")
    ContainerDb(adminDb, "Admin Database", "MySQL 8.0", "Lưu trữ bảng tenants, master_features, tenant_feature_grants")
  }

  System_Boundary(tenantPlane, "2. Tenant Feature Flag Plane (Instance)") {
    Container(tenantFlagUi, "Tenant Flag UI", "React, Vite", "Màn hình cấu hình cờ, gán rule và xuất file snapshot (Export)")
    Container(tenantFlagApi, "Feature Flag Service", "Spring Boot 4, Java 21", "Đánh giá chiến lược cờ, xuất file snapshot (Export) và gửi file sang Tracking Order")
    ContainerDb(tenantFlagDb, "Feature Flag DB", "MySQL 8.0", "Lưu trữ feature_flags, strategies, audit_logs")
  }

  System_Boundary(appPlane, "3. Business Application Plane (Tracking Order)") {
    Container(storefrontUi, "Storefront Web App", "React, Vite, TailwindCSS", "Giao diện người dùng mua sắm và theo dõi hành trình đơn hàng")
    Container(trackingAdminUi, "Tracking Order Admin UI", "React, Vite", "Giao diện quản trị đơn hàng & nạp file cấu hình cờ (Import Snapshot)")
    Container(orderApi, "Tracking Order Service", "Spring Boot 4, AspectJ, JPA", "Xử lý đơn hàng, tiếp nhận file snapshot (/sync-file & /import), kiểm tra cờ cục bộ qua AOP")
    ContainerDb(orderDb, "Tracking Order DB", "MySQL 8.0", "Lưu trữ orders, inventory và bảng feature_flag_configs (local snapshot)")
  }

  Rel(admin, adminUi, "Truy cập quản trị trung tâm", "HTTPS")
  Rel(adminUi, adminApi, "Gọi API quản lý", "JSON/REST")
  Rel(adminApi, adminDb, "Đọc/ghi dữ liệu", "JDBC")
  Rel(adminApi, tenantFlagApi, "Cấp cờ & Kích hoạt Apply", "JSON/HTTP")

  Rel(admin, tenantFlagUi, "Cấu hình cờ & bấm Xuất File", "HTTPS")
  Rel(tenantFlagUi, tenantFlagApi, "Tải file cấu hình (/api/v1/flags/export)", "File Download (.json)")
  Rel(tenantFlagApi, tenantFlagDb, "Đọc cấu hình cờ & chiến lược", "JDBC")

  Rel(admin, trackingAdminUi, "Tải lên file cấu hình (Import)", "HTTPS")
  Rel(trackingAdminUi, orderApi, "Upload file (/api/v1/feature-flags/import)", "Multipart/HTTPS")

  Rel(tenantFlagApi, orderApi, "Đẩy file snapshot (/api/v1/feature-flags/sync-file)", "Multipart/HTTP Stream (X-Internal-Token)")
  Rel(orderApi, orderDb, "Lưu & truy vấn snapshot cờ cục bộ", "JDBC")

  Rel(buyer, storefrontUi, "Duyệt web, mua hàng", "HTTPS")
  Rel(storefrontUi, orderApi, "Gửi request mua hàng / xem đơn hàng", "JSON/REST")
```

---

## 3. Component Diagram (Level 3 - C4Component)

Đi sâu vào cấu trúc bên trong của Container **Tracking Order Service**, minh họa cách hệ thống tiếp nhận **File Snapshot** (tránh nghẽn RAM khi có hàng nghìn user), parse dữ liệu theo luồng `InputStream` và lưu vào DB cục bộ để Spring AOP kiểm tra với độ trễ 0ms.

```mermaid
C4Component
  title Component Diagram - File Snapshot Processing & Feature Flag Checking

  Container_Ext(tenantFlagService, "Tenant Feature Flag Service", "Spring Boot", "Đẩy file snapshot cờ tính năng")
  Container_Ext(trackingAdminUi, "Tracking Order Admin UI", "React", "Tải lên file snapshot thủ công")
  ContainerDb(orderDb, "Tracking Order DB", "MySQL 8.0", "Bảng feature_flag_configs")
  Container_Ext(storefront, "Storefront UI", "React", "Gửi request nghiệp vụ")

  Container_Boundary(trackingApp, "Tracking Order Backend (Spring Boot)") {
    Component(syncCtrl, "InternalFeatureFlagController", "Spring MVC RestController", "Endpoint tiếp nhận file snapshot tự động (/sync-file) & import thủ công (/import)")
    Component(fileParser, "FeatureFlagSnapshotParser", "Spring Component", "Đọc luồng InputStream từ file snapshot, parse streaming tránh tải chuỗi lớn vào RAM")
    Component(configService, "FeatureFlagConfigServiceImpl", "Spring Service", "Ghi đè snapshot vào DB và đánh giá cờ theo Strategy Logic (AND/OR)")
    Component(repo, "FeatureFlagConfigRepo", "Spring Data JPA Repository", "Truy vấn bảng feature_flag_configs")

    Component(orderCtrl, "OrderController", "Spring MVC RestController", "Endpoint công khai phục vụ mua sắm: /buy-now, /{orderId}")
    Component(aspect, "FeatureFlagAspect", "Spring AspectJ (@Aspect)", "Chặn các method có gắn @RequireFeature trước khi thực thi")
    Component(annotation, "@RequireFeature", "Java Custom Annotation", "Đánh dấu danh sách cờ cần thiết: @RequireFeature({'BUY_NOW'})")
    Component(client, "FeatureFlagClient", "Spring Component (Facade)", "Cung cấp hàm tiện ích isEnabled(flagName) và evaluateAll()")
    Component(orderService, "OrderServiceImpl", "Spring Service", "Xử lý logic nghiệp vụ tạo đơn, chi tiết đơn")
  }

  Rel(tenantFlagService, syncCtrl, "1a. Đẩy file snapshot tự động", "POST /api/v1/feature-flags/sync-file (Multipart)")
  Rel(trackingAdminUi, syncCtrl, "1b. Tải lên file snapshot thủ công", "POST /api/v1/feature-flags/import (MultipartFile)")
  
  Rel(syncCtrl, fileParser, "2. Đọc luồng file (InputStream)", "Java call")
  Rel(fileParser, configService, "3. Chuyển danh sách cờ & rule đã parse", "Java call")
  Rel(configService, repo, "4. deleteAllInBatch() & saveAll()", "JPA")
  Rel(repo, orderDb, "5. Ghi snapshot vào DB cục bộ", "SQL")

  Rel(storefront, orderCtrl, "6. Gọi API GET /orders/{id}", "JSON/HTTP")
  Rel(orderCtrl, orderService, "7. Gọi getOrderDetail(id)", "Java Interface")
  Rel(aspect, annotation, "Chặn method được gắn", "Pointcut @annotation")
  Rel(aspect, orderService, "Chặn trước khi thực thi (@Before)", "AOP Proxy")
  Rel(aspect, client, "8. Gọi isEnabled('ORDER_DETAIL')", "Java call")
  Rel(client, configService, "9. Đánh giá cờ", "Java call")
  Rel(configService, repo, "10. Lấy cấu hình cờ cục bộ", "JPA/Cache")
  Rel(repo, orderDb, "11. Truy vấn cờ từ DB cục bộ", "SQL (~0ms)")
```

---

## 4. Dynamic Diagram (Level 4 - C4Dynamic)

Minh họa chi tiết các luồng hoạt động đồng bộ dạng file:

### Luồng 1A: Đồng bộ tự động qua File Stream (Push File Model)
Thay vì gửi chuỗi JSON thô trong HTTP Body (gây nghẽn log và tốn RAM khi có hàng nghìn user), `feature-flag-service` đóng gói thành file và gửi qua HTTP Multipart Stream.

```mermaid
C4Dynamic
  title Dynamic Diagram - Đồng Bộ Tự Động Qua File Stream (Push Model)

  Container(adminUi, "Admin UI", "React", "Giao diện quản trị")
  Container(flagService, "Feature Flag Service", "Spring Boot", "Tenant Engine")
  Container(orderService, "Tracking Order", "Spring Boot", "Client Service")
  ContainerDb(orderDb, "Tracking Order DB", "MySQL", "Cơ sở dữ liệu cục bộ")

  Rel(adminUi, flagService, "1. Nhấn Apply cờ cấu hình", "POST /api/v1/flags/apply")
  Rel(flagService, flagService, "2. Đóng gói danh sách cờ thành File Snapshot (.json)", "File Packaging")
  Rel(flagService, orderService, "3. Gửi file qua HTTP Multipart Stream", "POST /api/v1/feature-flags/sync-file (X-Internal-Token)")
  Rel(orderService, orderService, "4. Đọc file theo InputStream & validate", "Streaming Parse")
  Rel(orderService, orderDb, "5. Cập nhật bảng feature_flag_configs", "SQL deleteAll & saveAll")
```

### Luồng 1B: Đồng bộ thủ công qua Export & Import File (Offline / Air-Gapped Flow)
Phục vụ trường hợp hệ thống Core Production bị cách ly mạng (chặn Inbound traffic từ ngoài), hoặc phục vụ quy trình phê duyệt (Approval Gate) / sao lưu & khôi phục.

```mermaid
C4Dynamic
  title Dynamic Diagram - Xuất và Nhập File Cấu Hình (Export / Import Flow)

  Container(admin, "Quản Trị Viên (Ops)", "Browser", "Thao tác trên giao diện")
  Container(flagUi, "Tenant Flag UI", "React", "Giao diện Feature Flag")
  Container(flagService, "Feature Flag Service", "Spring Boot", "Tenant Engine")
  Container(trackingUi, "Tracking Order Admin UI", "React", "Giao diện Admin Tracking Order")
  Container(orderService, "Tracking Order", "Spring Boot", "Client Service")
  ContainerDb(orderDb, "Tracking Order DB", "MySQL", "Cơ sở dữ liệu cục bộ")

  Rel(admin, flagUi, "1. Nhấn nút 'Export Cấu Hình'", "Click UI")
  Rel(flagUi, flagService, "2. Yêu cầu tải file cấu hình", "GET /api/v1/flags/export")
  Rel(flagService, flagUi, "3. Trả về file feature-flags-VTIT.json", "Content-Disposition: attachment")
  Rel(flagUi, admin, "4. Lưu file về máy tính cá nhân", "File Download")

  Rel(admin, trackingUi, "5. Mở màn hình Admin Tracking-Order > Chọn Import File", "Upload File")
  Rel(trackingUi, orderService, "6. Gửi file JSON snapshot lên hệ thống", "POST /api/v1/feature-flags/import (MultipartFile)")
  Rel(orderService, orderService, "7. Validate định dạng, checksum & parse dữ liệu", "File Validation")
  Rel(orderService, orderDb, "8. Ghi đè cấu hình vào bảng feature_flag_configs", "SQL Batch Insert")
  Rel(orderService, trackingUi, "9. Phản hồi kết quả import thành công", "HTTP 200 (Success)")
  Rel(trackingUi, admin, "10. Hiển thị thông báo thành công & danh sách cờ mới", "Toast Notification")
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
  Rel(flagServiceA, orderServiceA, "Đẩy file snapshot cờ", "Port 8080 (Multipart)")
  Rel(orderServiceA, orderDbA, "Đọc/ghi đơn hàng & snapshot", "Port 3306")

  Rel(flagServiceB, flagDbB, "Kết nối", "Port 3306")
  Rel(flagServiceB, orderServiceB, "Đẩy file snapshot cờ", "Port 8080 (Multipart)")
  Rel(orderServiceB, orderDbB, "Đọc/ghi đơn hàng & snapshot", "Port 3306")
```

---

## 6. Điểm Nổi Bật Về Mặt Kiến Trúc (Architecture Highlights)

1. **Zero-Latency In-Memory Evaluation**:
   * Khi người dùng gọi API nghiệp vụ (ví dụ mua hàng `buyNow`), ứng dụng `tracking-order` **hoàn toàn không gọi bất kỳ HTTP request nào** sang `feature-flag-service`.
   * Cờ được đọc trực tiếp từ bảng snapshot cục bộ `feature_flag_configs` trong cùng cơ sở dữ liệu.
2. **File-Based Streaming - Giải quyết bài toán tải lớn & hàng nghìn User**:
   * Khi quy mô tổ chức mở rộng với hàng nghìn user trong các strategy (`users_by_name`), payload JSON sẽ phình to từ hàng trăm KB đến nhiều MB.
   * Chuyển sang cơ chế **File Stream / Multipart**:
     * Tránh nghẽn log, không làm ngập console server bằng hàng vạn ký tự JSON thô.
     * Tối ưu bộ nhớ đệm (RAM): Phía `tracking-order` đọc file theo luồng `InputStream`, tránh tình trạng thư viện JSON tải toàn bộ chuỗi khổng lồ vào Heap Memory gây nghẽn Garbage Collection (GC Pause) hoặc OutOfMemory.
3. **Hỗ trợ Môi Trường Cách Ly Mạng (Air-Gapped & Zero-Trust Architecture)**:
   * Chức năng **Export File** (tại Feature Flag Service) và **Import File** (tại Admin Tracking Order) cho phép hệ thống vận hành hoàn hảo ngay cả khi Core Production bị đóng toàn bộ Inbound Ports từ bên ngoài.
4. **Quản Lý Phiên Bản & Khôi Phục An Toàn (Rollback Ready)**:
   * Mỗi file export là một bản snapshot độc lập (`feature-flags-{tenant}-{version}.json`). Nếu bản phát hành mới gặp sự cố, đội ngũ vận hành chỉ cần import lại file snapshot của phiên bản ổn định trước đó để đưa hệ thống về trạng thái an toàn ngay tức thì.
5. **Clean Separation of Concerns với Spring AOP**:
   * Code nghiệp vụ sạch sẽ, hoàn toàn tách biệt việc kiểm tra cờ khỏi code xử lý kinh doanh nhờ Custom Annotation `@RequireFeature` và `FeatureFlagAspect`.
6. **Bảo Mật Push Model**:
   * Giao tiếp tự động giữa `feature-flag-service` và `tracking-order` được bảo vệ bằng header bí mật `X-Internal-Token`.
