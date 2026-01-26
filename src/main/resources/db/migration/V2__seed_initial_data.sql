-- seed admin user (password: admin123 - bcrypt encoded)
insert into users (name, email, password, role, active)
values ('Admin', 'admin@ordermanagement.com', '$2a$10$N.zmfTq.rqFqHQNzaHQLN.R.kq5B9m2xJGQrYr1q1J1J1J1J1J1J1', 'ADMIN', true);

-- seed some categories for testing
insert into categories (name, description, active) values
    ('Electronics', 'gadgets, phones, computers and tech stuff', true),
    ('Clothing', 'shirts, pants, shoes and accessories', true),
    ('Home & Garden', 'furniture, decor and outdoor items', true),
    ('Sports', 'equipment and gear for all sports', true),
    ('Books', 'physical and digital books', true);

-- seed some products for testing
insert into products (name, description, price, stock_quantity, sku, category_id, active) values
    ('iPhone 15 Pro', 'latest apple smartphone with titanium design', 7999.00, 50, 'ELEC-IPH15P', 1, true),
    ('MacBook Air M3', 'lightweight laptop with apple silicon', 12499.00, 30, 'ELEC-MBA-M3', 1, true),
    ('AirPods Pro 2', 'wireless earbuds with noise cancellation', 1899.00, 100, 'ELEC-APP2', 1, true),
    ('Nike Air Max', 'classic running shoes', 799.00, 200, 'CLTH-NAM-001', 2, true),
    ('Levi''s 501 Jeans', 'original fit denim jeans', 399.00, 150, 'CLTH-LV501', 2, true),
    ('IKEA Desk', 'minimalist work desk', 599.00, 40, 'HOME-DESK-01', 3, true),
    ('Wilson Tennis Racket', 'professional grade racket', 899.00, 25, 'SPRT-WTR-01', 4, true),
    ('Clean Code Book', 'robert c martin classic on software craftsmanship', 149.00, 500, 'BOOK-CC-001', 5, true);
