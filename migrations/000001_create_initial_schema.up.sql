-- users table - stores authentication and basic user info
create table users (
    id bigserial primary key,
    name varchar(100) not null,
    email varchar(150) not null unique,
    password varchar(255) not null,
    role varchar(20) not null,
    active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp
);

-- index for faster email lookups during login
create index idx_users_email on users(email);

-- categories table - product grouping
create table categories (
    id bigserial primary key,
    name varchar(100) not null,
    description varchar(500),
    active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp
);

-- products table - items available for purchase
create table products (
    id bigserial primary key,
    name varchar(150) not null,
    description varchar(1000),
    price decimal(10, 2) not null,
    stock_quantity integer not null default 0,
    sku varchar(50) unique,
    image_url varchar(500),
    active boolean not null default true,
    category_id bigint not null references categories(id),
    created_at timestamp not null default current_timestamp,
    updated_at timestamp
);

-- index for category filtering
create index idx_products_category on products(category_id);
create index idx_products_sku on products(sku);

-- customers table - people who can place orders
create table customers (
    id bigserial primary key,
    user_id bigint not null unique references users(id),
    cpf varchar(14) not null,
    phone varchar(15),
    street varchar(200),
    number varchar(10),
    complement varchar(100),
    neighborhood varchar(100),
    city varchar(100),
    state varchar(2),
    zip_code varchar(9),
    created_at timestamp not null default current_timestamp,
    updated_at timestamp
);

create index idx_customers_user on customers(user_id);
create index idx_customers_cpf on customers(cpf);

-- orders table - the main transaction record
create table orders (
    id bigserial primary key,
    order_number varchar(20) not null unique,
    customer_id bigint not null references customers(id),
    status varchar(20) not null,
    subtotal decimal(10, 2) not null,
    discount decimal(10, 2) default 0,
    shipping_cost decimal(10, 2) default 0,
    total decimal(10, 2) not null,
    shipping_street varchar(200),
    shipping_number varchar(10),
    shipping_complement varchar(100),
    shipping_neighborhood varchar(100),
    shipping_city varchar(100),
    shipping_state varchar(2),
    shipping_zip_code varchar(9),
    notes varchar(500),
    paid_at timestamp,
    shipped_at timestamp,
    delivered_at timestamp,
    cancelled_at timestamp,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp
);

create index idx_orders_customer on orders(customer_id);
create index idx_orders_status on orders(status);
create index idx_orders_number on orders(order_number);

-- order items - individual products in an order
create table order_items (
    id bigserial primary key,
    order_id bigint not null references orders(id) on delete cascade,
    product_id bigint not null references products(id),
    quantity integer not null,
    unit_price decimal(10, 2) not null,
    total decimal(10, 2) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp
);

create index idx_order_items_order on order_items(order_id);

-- payments table - tracks payment transactions
create table payments (
    id bigserial primary key,
    order_id bigint not null unique references orders(id),
    method varchar(20) not null,
    status varchar(20) not null,
    amount decimal(10, 2) not null,
    transaction_id varchar(100),
    installments integer default 1,
    paid_at timestamp,
    refunded_at timestamp,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp
);

create index idx_payments_order on payments(order_id);
create index idx_payments_transaction on payments(transaction_id);
