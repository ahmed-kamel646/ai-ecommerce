package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.sql.PreparedStatement;
import java.sql.Statement;

/**
 * Seeds categories, demo users (with freshly-computed BCrypt hashes), and 12
 * demo products. Java migration is used so BCrypt hashes are deterministic for
 * any given plaintext (no need to pre-pin a salt).
 */
public class V2__seed extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        try (Statement st = context.getConnection().createStatement()) {
            st.executeUpdate("""
                INSERT INTO category (name) VALUES
                    ('Electronics'),
                    ('Clothing'),
                    ('Shoes'),
                    ('Home & Kitchen'),
                    ('Sports'),
                    ('Books')
                """);
        }

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        String adminHash = encoder.encode("Admin123!");
        String shopperHash = encoder.encode("Shopper123!");
        try (PreparedStatement ps = context.getConnection().prepareStatement(
                "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)")) {
            ps.setString(1, "admin@demo.com");
            ps.setString(2, adminHash);
            ps.setString(3, "ADMIN");
            ps.executeUpdate();
            ps.setString(1, "shopper@demo.com");
            ps.setString(2, shopperHash);
            ps.setString(3, "SHOPPER");
            ps.executeUpdate();
        }

        try (Statement st = context.getConnection().createStatement()) {
            st.executeUpdate("""
                INSERT INTO product (name, description, price, stock, image_url, seo_tags, category_id) VALUES
                ('Wireless Headphones', 'Crisp sound with deep bass.',           99.99,  50, 'https://picsum.photos/seed/p1/600/600',  'electronics,audio',           (SELECT id FROM category WHERE name='Electronics')),
                ('Smartphone',          'Latest model, fast and elegant.',      699.99,  30, 'https://picsum.photos/seed/p2/600/600',  'electronics,phone',           (SELECT id FROM category WHERE name='Electronics')),
                ('Smart Watch',         'Fitness tracker with heart-rate.',     149.99,  45, 'https://picsum.photos/seed/p3/600/600',  'electronics,watch',           (SELECT id FROM category WHERE name='Electronics')),
                ('Gaming Laptop',       'Powerful laptop built for gaming.',   1499.99,  15, 'https://picsum.photos/seed/p4/600/600',  'electronics,computer,gaming', (SELECT id FROM category WHERE name='Electronics')),
                ('T-Shirt',             'Comfortable cotton, classic fit.',      19.99, 100, 'https://picsum.photos/seed/p5/600/600',  'clothing,shirt',              (SELECT id FROM category WHERE name='Clothing')),
                ('Jeans',               'Durable denim, slim cut.',              49.99,  60, 'https://picsum.photos/seed/p6/600/600',  'clothing,pants',              (SELECT id FROM category WHERE name='Clothing')),
                ('Jacket',              'Warm and cozy winter jacket.',          79.99,  35, 'https://picsum.photos/seed/p7/600/600',  'clothing,winter',             (SELECT id FROM category WHERE name='Clothing')),
                ('Sneakers',            'Lightweight running shoes.',            89.99,  40, 'https://picsum.photos/seed/p8/600/600',  'shoes,running',               (SELECT id FROM category WHERE name='Shoes')),
                ('Boots',               'Insulated winter boots.',              119.99,  25, 'https://picsum.photos/seed/p9/600/600',  'shoes,winter',                (SELECT id FROM category WHERE name='Shoes')),
                ('Coffee Maker',        'Brews fresh coffee daily.',             59.99,  40, 'https://picsum.photos/seed/p10/600/600', 'home,kitchen',                (SELECT id FROM category WHERE name='Home & Kitchen')),
                ('Yoga Mat',            'Non-slip exercise mat.',                19.99, 100, 'https://picsum.photos/seed/p11/600/600', 'sports,fitness',              (SELECT id FROM category WHERE name='Sports')),
                ('Novel',               'Bestselling fiction title.',            14.99, 120, 'https://picsum.photos/seed/p12/600/600', 'books,fiction',               (SELECT id FROM category WHERE name='Books'))
                """);
        }
    }
}
