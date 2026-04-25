CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_product_name_lower ON product(LOWER(name));
CREATE INDEX idx_product_draft ON product(draft) WHERE draft = TRUE;
CREATE INDEX idx_product_sold_count ON product(sold_count DESC);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_item_order ON order_item(order_id);
CREATE INDEX idx_cart_item_cart ON cart_item(cart_id);
