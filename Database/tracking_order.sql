CREATE DATABASE tracking_order;
use tracking_order;
create table users(
 id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
 username varchar(255) unique not null,
 phone varchar(15) unique not null,
 password varchar(255) not null,
 role enum('BUYER','SELLER','SHIPPER'),
 status enum('ACTIVE', 'INACTIVE'),
 created_at datetime default current_timestamp not null,
 update_at datetime default current_timestamp on update current_timestamp not null,
 created_by varchar(255),
 updated_by   varchar(255),
 deleted      TINYINT(1)   NOT NULL DEFAULT 0
 );
 
create table product_categories(
 id varchar(36) primary key default (UUID()),
 name varchar(255) not null,
 parent_id varchar(36) null,
 create_at datetime default current_timestamp not null,
 update_at datetime default current_timestamp on update current_timestamp not null,
 created_by varchar(255),
 updated_by   varchar(255),
 deleted      TINYINT(1)   NOT NULL DEFAULT 0
 );
 
alter table product_categories
add foreign key (parent_id) references product_categories(id);

create table carriers(
id varchar(36) primary key default (UUID()),
name varchar(255) not null,
api_endpoint varchar(255),
is_active tinyint(1) not null default 1,
support_regions text,
create_at datetime default current_timestamp not null,
update_at datetime default current_timestamp on update current_timestamp not null,
created_by varchar(255),
updated_by   varchar(255),
deleted      TINYINT(1)   NOT NULL DEFAULT 0
);

create table coupons(
id varchar(36) primary key default (UUID()),
code varchar(255) not null,
discount_type enum('PERCENT', 'FIXED') not null,
discount_value decimal(15,2) not null,
min_order_value decimal(15,2),
max_usage int,
used_count int,
expired_at datetime,
create_at datetime default current_timestamp not null,
update_at datetime default current_timestamp on update current_timestamp not null,
created_by varchar(255),
updated_by   varchar(255),
deleted      TINYINT(1)   NOT NULL DEFAULT 0
);

create table products(
id varchar(36) primary key default (uuid()),
categories_id varchar(36) ,
name varchar(255) not null,
seller_id varchar(36),
base_price decimal(15,2) not null,
description text not null,
weight_gram bigint,
create_at datetime default current_timestamp not null,
update_at datetime default current_timestamp on update current_timestamp not null,
created_by varchar(255),
updated_by   varchar(255),
deleted      TINYINT(1)   NOT NULL DEFAULT 0
);

alter table products
add foreign key (categories_id) references product_categories(id),
add foreign key (seller_id) references users(id);

create table user_addresses(
id varchar(36) primary key default (uuid()),
user_id varchar(36),
name varchar(255) not null,
phone varchar(15) not null,
province varchar(255) not null,
city varchar(100) not null,
district varchar(100) not null,
detail_address text not null,
is_default tinyint(1) default 0,
create_at datetime default current_timestamp not null,
update_at datetime default current_timestamp on update current_timestamp not null,
created_by varchar(255),
updated_by   varchar(255),
deleted      TINYINT(1)   NOT NULL DEFAULT 0
);

alter table user_addressesproducts_ibfk_1
add foreign key (user_id) references users(id);

create table shipping_fees(
id varchar(36) primary key default(uuid()),
carrier_id varchar(36),
region_name varchar(255) not null,
weight_from_gram bigint not null,
weight_to_gram bigint not null,
base_fee decimal(15,2) not null,
extra_fee_per_kg decimal(15,2) not null,
free_ship_threshold decimal(15,2) not null,
create_at datetime default current_timestamp not null,
update_at datetime default current_timestamp on update current_timestamp not null,
created_by varchar(255),
updated_by   varchar(255),
deleted      TINYINT(1)   NOT NULL DEFAULT 0,
foreign key (carrier_id) references carriers(id)
);

create table product_variants(
id varchar(36) primary key default (uuid()),
product_id varchar(36),
name varchar(255) not null,
sku varchar(100) not null,
price_modifier decimal(15,2),
create_at datetime default current_timestamp not null,
update_at datetime default current_timestamp on update current_timestamp not null,
created_by varchar(255),
updated_by   varchar(255),
deleted      TINYINT(1)   NOT NULL DEFAULT 0,
foreign key (product_id) references products(id)
);

create table carts(
id varchar(36) primary key default (uuid()),
user_id varchar(36),
coupon_id varchar(36) null,
create_at datetime default current_timestamp not null,
update_at datetime default current_timestamp on update current_timestamp not null,
created_by varchar(255),
updated_by   varchar(255),
deleted      TINYINT(1)   NOT NULL DEFAULT 0
);
alter table carts
add foreign key (user_id) references users(id);

alter table carts
add foreign key (coupon_id) references coupons(id);

create table orders(
id varchar(36) primary key default (uuid()),
user_id varchar(36),
address_id varchar(36),
carrier_id varchar(36),
tracking_number varchar(50) null,
status enum('PENDING', 'CONFIRMED', 'PICKING', 'SHIPPING', 'DELIVERED', 'FAILED', 'RETURNING', 'REATTEMPT'),
subtotal decimal(15,2),
discount_amount decimal(15,2),
shipping_fee decimal(15,2),
grand_total decimal(15,2),
payment_type enum('COD', 'ONLINE'),
estimated_delivery_date date null,
create_at datetime default current_timestamp not null,
update_at datetime default current_timestamp on update current_timestamp not null,
created_by varchar(255),
updated_by   varchar(255),
deleted      TINYINT(1)   NOT NULL DEFAULT 0,
foreign key (user_id) references users(id),
foreign key (address_id) references user_addresses(id),
foreign key (carrier_id) references carriers(id)
);
 
create table inventories(
 id varchar(36) primary key default(uuid()),
 product_id varchar(36),
 variant_id varchar(36),
 quantity_in_stock bigint not null,
 warehouse_location varchar(255),
 create_at datetime default current_timestamp not null,
 update_at datetime default current_timestamp on update current_timestamp not null,
 created_by varchar(255),
 updated_by   varchar(255),
 deleted      TINYINT(1)   NOT NULL DEFAULT 0,
 foreign key (product_id) references products(id),
 foreign key (variant_id) references product_variants(id)
 );

create table cart_items(
id varchar(36) primary key default (uuid()),
cart_id varchar(36),
product_variant_id varchar(36),
quantity bigint not null,
price_snapshot decimal(15,2),
create_at datetime default current_timestamp not null,
update_at datetime default current_timestamp on update current_timestamp not null,
created_by varchar(255),
updated_by   varchar(255),
deleted      TINYINT(1)   NOT NULL DEFAULT 0,
foreign key (cart_id) references carts(id),
foreign key (product_variant_id) references product_variants(id)
);

create table order_items(
id varchar(36) primary key default(uuid()),
order_id varchar(36),
product_variant_id varchar(36),
quantity bigint not null,
unit_price decimal(15,2) not null,
create_at datetime default current_timestamp not null,
update_at datetime default current_timestamp on update current_timestamp not null,
created_by varchar(255),
updated_by   varchar(255),
deleted      TINYINT(1)   NOT NULL DEFAULT 0,
foreign key (order_id) references orders(id),
foreign key (product_variant_id) references product_variants(id)
);

create table payment_methods(
id varchar(36) primary key default(uuid()),
order_id varchar(36),
method_type enum('COD', 'VNPAY', 'MOMO') not null,
transaction_id varchar(100) null,
status enum('UNPAID', 'AWAITING_PAYMENT', 'PAID', 'FAILED') not null,
paid_at datetime null, 
create_at datetime default current_timestamp not null,
update_at datetime default current_timestamp on update current_timestamp not null,
created_by varchar(255),
updated_by   varchar(255),
deleted      TINYINT(1)   NOT NULL DEFAULT 0,
foreign key (order_id) references orders(id)
);

create table tracking_logs(
id varchar(36) primary key default (uuid()),
order_id varchar(36),
update_by varchar(36),
from_status varchar(50),
to_status varchar(50),
note varchar(500),
location_description varchar(255), 
timestamp timestamp,
create_at datetime default current_timestamp not null,
update_at datetime default current_timestamp on update current_timestamp not null,
created_by varchar(255),
updated_by   varchar(255),
deleted      TINYINT(1)   NOT NULL DEFAULT 0,
foreign key (order_id) references orders(id),
foreign key (update_by) references users(id)
);

create table returns(
id varchar(36) primary key default (uuid()),
order_id varchar(36),
user_id varchar(36),
reason enum('DAMAGED', 'WRONG_ITEM', 'FAILED_DELIVERY', 'DEFECTIVE'),
origin_type enum('CUSTOMER', 'CARRIER'),
status enum('REQUESTEDIN_TRANSIT', 'WAREHOUSE_RECEIVED', 'RESTOCKED', 'REFUNDED'),
refund_amount decimal(15,2),
notes varchar(500),
create_at datetime default current_timestamp not null,
update_at datetime default current_timestamp on update current_timestamp not null,
created_by varchar(255),
updated_by   varchar(255),
deleted      TINYINT(1)   NOT NULL DEFAULT 0,
foreign key (order_id) references orders(id),
foreign key (user_id) references users(id)
);

create table product_reviews(
id varchar(36) primary key default (uuid()),
product_id varchar(36),
order_item_id varchar(36),
user_id varchar(36),
rating tinyint check (rating >=1 and rating <=5),
comment text,
 create_at datetime default current_timestamp not null,
 update_at datetime default current_timestamp on update current_timestamp not null,
 created_by varchar(255),
 updated_by   varchar(255),
 deleted      TINYINT(1)   NOT NULL DEFAULT 0,
 foreign key (product_id) references products(id),
 foreign key (order_item_id) references order_items(id),
 foreign key (user_id) references users(id)
 );
 
 show create table coupons;
 
 ## coupon_idcarts_ibfk_2
ALTER TABLE carts
DROP FOREIGN KEY carts_ibfk_2;

ALTER TABLE carts
DROP INDEX coupon_id;
 
 ALTER TABLE orders
ADD COLUMN coupon_id varchar(36) NULL;

ALTER TABLE orders
ADD CONSTRAINT fk_orders_coupon
FOREIGN KEY (coupon_id)
REFERENCES coupons(id);

alter table carts
drop column coupon_id;






 














 

