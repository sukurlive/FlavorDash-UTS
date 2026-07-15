const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'flavordash_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promiseDb = db.promise();

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateAccessToken(userId, email) {
    return jwt.sign(
        { userId, email, type: 'access' },
        process.env.JWT_SECRET || 'FlavorDashSecret2026',
        { expiresIn: '7d' }
    );
}

function generateRefreshToken(userId, email) {
    return jwt.sign(
        { userId, email, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'FlavorDashRefreshSecret2026',
        { expiresIn: '30d' }
    );
}

async function verifyAccessToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access token required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'FlavorDashSecret2026');
        if (decoded.type !== 'access') {
            return res.status(401).json({ error: 'Invalid token type' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
}

// ========== ADMIN MIDDLEWARE ==========
async function verifyAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access token required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'FlavorDashSecret2026');
        if (decoded.type !== 'access') {
            return res.status(401).json({ error: 'Invalid token type' });
        }
        
        // Cek apakah user adalah admin
        const [users] = await promiseDb.query('SELECT role FROM users WHERE id = ?', [decoded.userId]);
        if (users.length === 0 || users[0].role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
}

let tempCarts = new Map();

async function setupDatabase() {
    try {
        await promiseDb.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'flavordash_db'}`);
        await promiseDb.query(`USE ${process.env.DB_NAME || 'flavordash_db'}`);
        
        await promiseDb.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                uuid VARCHAR(36) NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                phone VARCHAR(20),
                bio TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        await promiseDb.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                token VARCHAR(500) NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                revoked BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        
        await promiseDb.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                uuid VARCHAR(36) NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                image_url TEXT,
                description TEXT,
                stock INT DEFAULT 10,
                is_available BOOLEAN DEFAULT TRUE,
                category_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await promiseDb.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                uuid VARCHAR(36) NOT NULL UNIQUE,
                name VARCHAR(50) NOT NULL,
                icon VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await promiseDb.query(`
            CREATE TABLE IF NOT EXISTS user_addresses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                uuid VARCHAR(36) NOT NULL UNIQUE,
                user_id INT NOT NULL,
                label VARCHAR(50) DEFAULT 'Rumah',
                recipient_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                address TEXT NOT NULL,
                city VARCHAR(100) NOT NULL,
                postal_code VARCHAR(10),
                is_default BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        
        await promiseDb.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                uuid VARCHAR(36) NOT NULL UNIQUE,
                user_id INT NOT NULL,
                order_number VARCHAR(50) NOT NULL UNIQUE,
                total_amount DECIMAL(12,2) NOT NULL,
                status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
                payment_method VARCHAR(50),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        
        await promiseDb.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                uuid VARCHAR(36) NOT NULL UNIQUE,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                price DECIMAL(10,2) NOT NULL,
                subtotal DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);
        
        // Insert sample categories
        const [existingCategories] = await promiseDb.query('SELECT id FROM categories LIMIT 1');
        if (existingCategories.length === 0) {
            await promiseDb.query(`
                INSERT INTO categories (uuid, name, icon) VALUES 
                (UUID(), 'Makanan', 'restaurant'),
                (UUID(), 'Minuman', 'local-cafe'),
                (UUID(), 'Snack', 'fastfood')
            `);
            console.log('✅ Sample categories inserted');
        }
        
        // Insert sample products
        const [existingProducts] = await promiseDb.query('SELECT id FROM products LIMIT 1');
        if (existingProducts.length === 0) {
            const products = [
                ['🍛 Nasi Goreng Spesial', 35000, 'nasi-goreng.jpg', 'Nasi goreng dengan telur mata sapi, ayam suwir', 20, 1],
                ['🍜 Mie Ayam Jamur', 25000, 'mie-ayam.jpg', 'Mie ayam dengan topping jamur, pangsit', 15, 1],
                ['🍢 Sate Ayam Madura', 40000, 'sate-ayam.jpg', '10 tusuk sate ayam dengan bumbu kacang', 10, 1],
                ['🥘 Rendang Padang', 45000, 'rendang.jpg', 'Daging sapi dimasak dengan bumbu rendang', 8, 1],
                ['🥗 Gado-Gado', 28000, 'gado-gado.jpg', 'Sayuran rebus dengan bumbu kacang', 25, 1],
                ['🍹 Es Jeruk Segar', 12000, 'es-jeruk.jpg', 'Jeruk peras segar dengan es batu', 50, 2]
            ];
            for (const p of products) {
                await promiseDb.query(
                    'INSERT INTO products (uuid, name, price, image_url, description, stock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [generateUUID(), p[0], p[1], p[2], p[3], p[4], p[5]]
                );
            }
            console.log('✅ Sample products inserted');
        }
        
        // Insert sample user
        const [existingUser] = await promiseDb.query('SELECT id FROM users WHERE email = ?', ['user@example.com']);
        if (existingUser.length === 0) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await promiseDb.query(
                'INSERT INTO users (uuid, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
                [generateUUID(), 'Demo User', 'user@example.com', hashedPassword, 'user']
            );
            console.log('✅ Sample user created: user@example.com / password123');
        }
        
        // Insert sample admin (jika belum ada)
        const [existingAdmin] = await promiseDb.query('SELECT id FROM users WHERE email = ?', ['admin@flavordash.com']);
        if (existingAdmin.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await promiseDb.query(
                'INSERT INTO users (uuid, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
                [generateUUID(), 'Admin FlavorDash', 'admin@flavordash.com', hashedPassword, 'admin']
            );
            console.log('✅ Admin user created: admin@flavordash.com / admin123');
        }
        
        console.log('✅ Database setup complete');
    } catch (err) {
        console.error('Database setup error:', err);
    }
}

// ========== AUTH ENDPOINTS ==========
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password min 6 characters' });
    
    try {
        const [existing] = await promiseDb.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const uuid = generateUUID();
        await promiseDb.query('INSERT INTO users (uuid, name, email, password) VALUES (?, ?, ?, ?)', [uuid, name, email, hashedPassword]);
        
        const [newUser] = await promiseDb.query('SELECT id, uuid, name, email, role FROM users WHERE email = ?', [email]);
        const accessToken = generateAccessToken(newUser[0].id, email);
        const refreshToken = generateRefreshToken(newUser[0].id, email);
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await promiseDb.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [newUser[0].id, refreshToken, expiresAt]);
        
        res.status(201).json({ success: true, user: newUser[0], accessToken, refreshToken });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    
    try {
        const [users] = await promiseDb.query('SELECT id, uuid, name, email, password, role FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });
        
        const accessToken = generateAccessToken(user.id, email);
        const refreshToken = generateRefreshToken(user.id, email);
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await promiseDb.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, refreshToken, expiresAt]);
        
        delete user.password;
        res.json({ success: true, user, accessToken, refreshToken });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/logout', verifyAccessToken, async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
    try {
        await promiseDb.query('UPDATE refresh_tokens SET revoked = TRUE WHERE token = ?', [refreshToken]);
        res.json({ success: true, message: 'Logged out' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========== PROFILE ENDPOINTS ==========
app.get('/api/profile', verifyAccessToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const [users] = await promiseDb.query(
            'SELECT id, uuid, name, email, phone, bio, role, created_at FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const [addresses] = await promiseDb.query(
            'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
            [userId]
        );
        
        res.json({ 
            success: true, 
            user: users[0],
            addresses 
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/profile', verifyAccessToken, async (req, res) => {
    const userId = req.user.userId;
    const { name, phone, bio } = req.body;
    
    try {
        await promiseDb.query(
            'UPDATE users SET name = ?, phone = ?, bio = ? WHERE id = ?',
            [name, phone || null, bio || null, userId]
        );
        
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========== ADDRESS ENDPOINTS ==========
app.get('/api/addresses', verifyAccessToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const [addresses] = await promiseDb.query(
            'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
            [userId]
        );
        res.json({ success: true, addresses });
    } catch (err) {
        console.error('Get addresses error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/addresses', verifyAccessToken, async (req, res) => {
    const userId = req.user.userId;
    const { label, recipient_name, phone, address, city, postal_code, is_default } = req.body;
    
    if (!recipient_name || !phone || !address || !city) {
        return res.status(400).json({ error: 'Please fill all required fields' });
    }
    
    const connection = await promiseDb.getConnection();
    try {
        await connection.beginTransaction();
        
        if (is_default) {
            await connection.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
        }
        
        const uuid = generateUUID();
        await connection.query(
            `INSERT INTO user_addresses (uuid, user_id, label, recipient_name, phone, address, city, postal_code, is_default) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuid, userId, label || 'Rumah', recipient_name, phone, address, city, postal_code || null, is_default || false]
        );
        
        await connection.commit();
        res.status(201).json({ success: true, message: 'Address added successfully' });
    } catch (err) {
        await connection.rollback();
        console.error('Add address error:', err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        connection.release();
    }
});

app.put('/api/addresses/:id', verifyAccessToken, async (req, res) => {
    const userId = req.user.userId;
    const addressId = req.params.id;
    const { label, recipient_name, phone, address, city, postal_code, is_default } = req.body;
    
    const connection = await promiseDb.getConnection();
    try {
        await connection.beginTransaction();
        
        const [existing] = await connection.query('SELECT id FROM user_addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Address not found' });
        }
        
        if (is_default) {
            await connection.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ? AND id != ?', [userId, addressId]);
        }
        
        await connection.query(
            `UPDATE user_addresses 
             SET label = ?, recipient_name = ?, phone = ?, address = ?, city = ?, postal_code = ?, is_default = ?
             WHERE id = ? AND user_id = ?`,
            [label || 'Rumah', recipient_name, phone, address, city, postal_code || null, is_default || false, addressId, userId]
        );
        
        await connection.commit();
        res.json({ success: true, message: 'Address updated successfully' });
    } catch (err) {
        await connection.rollback();
        console.error('Update address error:', err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        connection.release();
    }
});

app.delete('/api/addresses/:id', verifyAccessToken, async (req, res) => {
    const userId = req.user.userId;
    const addressId = req.params.id;
    
    try {
        const [result] = await promiseDb.query('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.json({ success: true, message: 'Address deleted successfully' });
    } catch (err) {
        console.error('Delete address error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/addresses/:id/default', verifyAccessToken, async (req, res) => {
    const userId = req.user.userId;
    const addressId = req.params.id;
    
    const connection = await promiseDb.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
        await connection.query('UPDATE user_addresses SET is_default = TRUE WHERE id = ? AND user_id = ?', [addressId, userId]);
        await connection.commit();
        res.json({ success: true, message: 'Default address set successfully' });
    } catch (err) {
        await connection.rollback();
        console.error('Set default address error:', err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        connection.release();
    }
});

// ========== PRODUCTS & CATEGORIES ==========
app.get('/api/products', async (req, res) => {
    try {
        const [products] = await promiseDb.query(
            `SELECT p.*, c.id as category_id, c.name as category_name, c.icon as category_icon 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.is_available = TRUE`
        );
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productsWithUrl = products.map(product => ({
            ...product,
            image: product.image_url ? `${baseUrl}/uploads/${product.image_url}` : null
        }));
        
        res.json(productsWithUrl);
    } catch (err) {
        console.error('Products error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/products/category/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
    try {
        const [products] = await promiseDb.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.category_id = ? AND p.is_available = TRUE`,
            [categoryId]
        );
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productsWithUrl = products.map(product => ({
            ...product,
            image: product.image_url ? `${baseUrl}/uploads/${product.image_url}` : null
        }));
        
        res.json(productsWithUrl);
    } catch (err) {
        console.error('Products by category error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await promiseDb.query('SELECT * FROM categories');
        res.json(categories);
    } catch (err) {
        console.error('Categories error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========== CART ENDPOINTS ==========
app.get('/api/cart', verifyAccessToken, async (req, res) => {
    const userId = req.user.userId;
    const cart = tempCarts.get(userId) || [];
    const cartWithDetails = [];
    for (const item of cart) {
        const [products] = await promiseDb.query('SELECT id, name, price, image_url FROM products WHERE id = ?', [item.productId]);
        if (products.length > 0) {
            cartWithDetails.push({
                productId: item.productId,
                quantity: item.quantity,
                product: products[0],
                subtotal: products[0].price * item.quantity
            });
        }
    }
    const total = cartWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
    res.json({ success: true, cart: cartWithDetails, total, itemCount: cart.length });
});

app.post('/api/cart/add', verifyAccessToken, async (req, res) => {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;
    const [products] = await promiseDb.query('SELECT id, stock FROM products WHERE id = ? AND is_available = TRUE', [productId]);
    if (products.length === 0) return res.status(404).json({ error: 'Product not found' });
    let cart = tempCarts.get(userId) || [];
    const existingIndex = cart.findIndex(item => item.productId === productId);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({ productId, quantity });
    }
    tempCarts.set(userId, cart);
    res.json({ success: true, message: 'Added to cart', itemCount: cart.length });
});

app.put('/api/cart/update', verifyAccessToken, async (req, res) => {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
    let cart = tempCarts.get(userId) || [];
    const index = cart.findIndex(item => item.productId === productId);
    if (index > -1) {
        if (quantity <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = quantity;
        }
        tempCarts.set(userId, cart);
    }
    res.json({ success: true, itemCount: cart.length });
});

app.delete('/api/cart/remove', verifyAccessToken, async (req, res) => {
    const userId = req.user.userId;
    const { productId } = req.body;
    let cart = tempCarts.get(userId) || [];
    cart = cart.filter(item => item.productId !== productId);
    tempCarts.set(userId, cart);
    res.json({ success: true, message: 'Product removed', itemCount: cart.length });
});

app.post('/api/checkout', verifyAccessToken, async (req, res) => {
    const userId = req.user.userId;
    const { paymentMethod = 'cash', notes = '' } = req.body;
    const cart = tempCarts.get(userId) || [];
    if (cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    
    const connection = await promiseDb.getConnection();
    try {
        await connection.beginTransaction();
        let totalAmount = 0;
        const orderItems = [];
        for (const item of cart) {
            const [products] = await connection.query('SELECT id, name, price, stock FROM products WHERE id = ?', [item.productId]);
            if (products.length === 0) throw new Error(`Product not found`);
            const product = products[0];
            if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
            const subtotal = product.price * item.quantity;
            totalAmount += subtotal;
            orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price, subtotal });
            await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId]);
        }
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const orderUuid = generateUUID();
        await connection.query('INSERT INTO orders (uuid, user_id, order_number, total_amount, payment_method, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [orderUuid, userId, orderNumber, totalAmount, paymentMethod, notes, 'pending']);
        const [newOrder] = await connection.query('SELECT id FROM orders WHERE order_number = ?', [orderNumber]);
        const orderId = newOrder[0].id;
        for (const item of orderItems) {
            await connection.query('INSERT INTO order_items (uuid, order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?, ?)', [generateUUID(), orderId, item.productId, item.quantity, item.price, item.subtotal]);
        }
        tempCarts.delete(userId);
        await connection.commit();
        res.json({ success: true, message: 'Order created', order: { orderNumber, totalAmount, status: 'pending' } });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message || 'Checkout failed' });
    } finally {
        connection.release();
    }
});

app.get('/api/orders', verifyAccessToken, async (req, res) => {
    const userId = req.user.userId;
    const [orders] = await promiseDb.query('SELECT o.*, (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC', [userId]);
    res.json({ success: true, orders });
});

app.get('/api/orders/:orderId', verifyAccessToken, async (req, res) => {
    const userId = req.user.userId;
    const { orderId } = req.params;
    const [orders] = await promiseDb.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });
    const [items] = await promiseDb.query('SELECT oi.*, p.name, p.image_url as image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?', [orderId]);
    res.json({ success: true, order: orders[0], items });
});

// ========== ADMIN ENDPOINTS ==========

// GET semua orders (termasuk user info) - Admin only
app.get('/api/admin/orders', verifyAdmin, async (req, res) => {
    try {
        const [orders] = await promiseDb.query(
            `SELECT o.*, 
                u.name as user_name, u.email as user_email,
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
             FROM orders o
             JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC`
        );
        res.json({ success: true, orders });
    } catch (err) {
        console.error('Admin orders error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET detail order oleh admin
app.get('/api/admin/orders/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [orders] = await promiseDb.query(
            `SELECT o.*, 
                u.name as user_name, u.email as user_email 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.id = ?`,
            [id]
        );
        
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const [items] = await promiseDb.query(
            `SELECT oi.*, p.name, p.image_url as image 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?`,
            [id]
        );
        
        res.json({ success: true, order: orders[0], items });
    } catch (err) {
        console.error('Admin order detail error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// UPDATE status order oleh admin
app.put('/api/admin/orders/:id/status', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    try {
        await promiseDb.query(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, id]
        );
        
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET all users (Admin only)
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
    try {
        const [users] = await promiseDb.query(
            'SELECT id, uuid, name, email, role, phone, bio, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, users });
    } catch (err) {
        console.error('Admin users error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// UPDATE user role (Admin only)
app.put('/api/admin/users/:id/role', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }
    
    try {
        await promiseDb.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ success: true, message: 'User role updated successfully' });
    } catch (err) {
        console.error('Update user role error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET all products (Admin only - including unavailable)
app.get('/api/admin/products', verifyAdmin, async (req, res) => {
    try {
        const [products] = await promiseDb.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             ORDER BY p.created_at DESC`
        );
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productsWithUrl = products.map(product => ({
            ...product,
            image: product.image_url ? `${baseUrl}/uploads/${product.image_url}` : null
        }));
        
        res.json({ success: true, products: productsWithUrl });
    } catch (err) {
        console.error('Admin products error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// UPDATE product (Admin only)
app.put('/api/admin/products/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, price, description, stock, is_available, category_id, image_url } = req.body;
    
    try {
        await promiseDb.query(
            `UPDATE products 
             SET name = ?, price = ?, description = ?, stock = ?, is_available = ?, category_id = ?, image_url = ?
             WHERE id = ?`,
            [name, price, description, stock, is_available, category_id, image_url, id]
        );
        
        res.json({ success: true, message: 'Product updated successfully' });
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// CREATE product (Admin only)
app.post('/api/admin/products', verifyAdmin, async (req, res) => {
    const { name, price, description, stock, is_available, category_id, image_url } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ error: 'Name and price are required' });
    }
    
    try {
        const uuid = generateUUID();
        await promiseDb.query(
            `INSERT INTO products (uuid, name, price, description, stock, is_available, category_id, image_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuid, name, price, description || '', stock || 10, is_available !== undefined ? is_available : true, category_id || null, image_url || null]
        );
        
        res.status(201).json({ success: true, message: 'Product created successfully' });
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE product (Admin only)
app.delete('/api/admin/products/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    
    try {
        const [result] = await promiseDb.query('DELETE FROM products WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========== START SERVER ==========
async function startServer() {
    await setupDatabase();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📁 Uploads folder: ${path.join(__dirname, 'uploads')}`);
        console.log(`\n🔑 Sample Login:`);
        console.log(`   User:  user@example.com / password123`);
        console.log(`   Admin: admin@example.com / password123\n`);
    });
}

startServer().catch(console.error);