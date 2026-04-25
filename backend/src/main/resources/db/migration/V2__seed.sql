INSERT INTO category (name) VALUES ('Electronics'), ('Clothing'), ('Shoes');

-- Admin123! hash
INSERT INTO users (email, password, role) VALUES ('admin@demo.com', '$2a$10$pLqWFVBshx.JHdYVwng2sOq79odFCzLUPRcYcN9I2r5g4Bur32ng2', 'ADMIN');
-- Shopper123! hash
INSERT INTO users (email, password, role) VALUES ('shopper@demo.com', '$2a$10$ghQO.J.d92p5nJRuEmnFoOxAtZ3.UYvLx1ii.Ev1QssTfAmLPPKVW', 'SHOPPER');

-- 8 sample products (vectors are NULL, VectorBackfillRunner will fill them)
INSERT INTO product (name, description, price, stock, image_url, seo_tags, category_id, image_vector) VALUES
('Wireless Headphones', 'High quality sound.', 99.99, 50, 'https://picsum.photos/seed/1/600/600', 'electronics,audio', 1, NULL),
('Smartphone', 'Latest model.', 699.99, 30, 'https://picsum.photos/seed/2/600/600', 'electronics,phone', 1, NULL),
('T-Shirt', 'Comfortable cotton.', 19.99, 100, 'https://picsum.photos/seed/3/600/600', 'clothing,shirt', 2, NULL),
('Jeans', 'Durable denim.', 49.99, 60, 'https://picsum.photos/seed/4/600/600', 'clothing,pants', 2, NULL),
('Sneakers', 'Running shoes.', 89.99, 40, 'https://picsum.photos/seed/5/600/600', 'shoes,running', 3, NULL),
('Boots', 'Winter boots.', 119.99, 25, 'https://picsum.photos/seed/6/600/600', 'shoes,winter', 3, NULL),
('Jacket', 'Warm and cozy.', 79.99, 35, 'https://picsum.photos/seed/7/600/600', 'clothing,winter', 2, NULL),
('Smart Watch', 'Fitness tracker.', 149.99, 45, 'https://picsum.photos/seed/8/600/600', 'electronics,watch', 1, NULL);
