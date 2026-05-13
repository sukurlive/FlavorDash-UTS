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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        
        const [existingProducts] = await promiseDb.query('SELECT id FROM products LIMIT 1');        
        const [existingUser] = await promiseDb.query('SELECT id FROM users WHERE email = ?', ['user@example.com']);
        
        console.log('Database setup complete');
    } catch (err) {
        console.error('Database setup error:', err);
    }
}

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

// Get all products (dengan informasi kategori)
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

// Get products by category
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

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await promiseDb.query('SELECT * FROM categories');
        res.json(categories);
    } catch (err) {
        console.error('Categories error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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

// Start server
async function startServer() {
    await setupDatabase();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\nServer running on http://localhost:${PORT}`);
        console.log(`Uploads folder: ${path.join(__dirname, 'uploads')}`);
        console.log(`Sample login: user@example.com / password123\n`);
    });
}

startServer().catch(console.error);