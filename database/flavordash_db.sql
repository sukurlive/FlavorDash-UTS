-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 13, 2026 at 01:48 PM
-- Server version: 8.4.3
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `flavordash_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `uuid`, `name`, `icon`, `created_at`) VALUES
(1, '3ab21614-4ec7-11f1-96d0-4ccc6a0144bd', 'Makanan', 'restaurant', '2026-05-13 12:28:21'),
(2, '3ab21aa9-4ec7-11f1-96d0-4ccc6a0144bd', 'Minuman', 'local-cafe', '2026-05-13 12:28:21'),
(3, '3ab21be7-4ec7-11f1-96d0-4ccc6a0144bd', 'Snack', 'fastfood', '2026-05-13 12:28:21');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `user_id` int NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `status` enum('pending','processing','completed','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` text,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stock` int DEFAULT '10',
  `is_available` tinyint(1) DEFAULT '1',
  `category_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `uuid`, `name`, `price`, `image_url`, `description`, `created_at`, `stock`, `is_available`, `category_id`) VALUES
(1, 'c76e7062-4eba-11f1-96d0-4ccc6a0144bd', '🍛 Nasi Goreng Spesial', 35000.00, 'nasi-goreng.jpg', 'Nasi goreng dengan telur mata sapi, ayam suwir, kerupuk, dan acar', '2026-05-13 10:59:14', 20, 1, 1),
(2, 'c76e779b-4eba-11f1-96d0-4ccc6a0144bd', '🍜 Mie Ayam Jamur', 25000.00, 'mie-ayam.jpg', 'Mie ayam dengan topping jamur, pangsit goreng, bakso, dan sawi', '2026-05-13 10:59:14', 15, 1, 1),
(3, 'c76e7930-4eba-11f1-96d0-4ccc6a0144bd', '🍢 Sate Ayam Madura', 40000.00, 'sate-ayam.jpg', '10 tusuk sate ayam dengan bumbu kacang, lontong, dan kecap', '2026-05-13 10:59:14', 10, 1, 1),
(4, 'c76e7a37-4eba-11f1-96d0-4ccc6a0144bd', '🥘 Rendang Padang', 45000.00, 'rendang.jpg', 'Daging sapi dimasak dengan bumbu rendang khas Padang, empuk dan pedas', '2026-05-13 10:59:14', 8, 1, 1),
(5, 'c76e7ac9-4eba-11f1-96d0-4ccc6a0144bd', '🥗 Gado-Gado', 28000.00, 'gado-gado.jpg', 'Sayuran rebus dengan bumbu kacang, kerupuk, dan telur', '2026-05-13 10:59:14', 25, 1, 1),
(6, 'c76e7b57-4eba-11f1-96d0-4ccc6a0144bd', '🍲 Rawon Surabaya', 38000.00, 'rawon.jpg', 'Sup daging hitam khas Surabaya dengan kluwek, telur asin, dan tauge', '2026-05-13 10:59:14', 12, 1, 1),
(7, 'c76e7bdd-4eba-11f1-96d0-4ccc6a0144bd', '🍗 Ayam Bakar Madura', 42000.00, 'ayam-bakar.jpg', 'Ayam bakar dengan bumbu madura, sambal terasi, dan lalapan', '2026-05-13 10:59:14', 10, 1, 1),
(8, 'c76e7cd4-4eba-11f1-96d0-4ccc6a0144bd', '🍚 Nasi Uduk Komplit', 30000.00, 'nasi-uduk.jpg', 'Nasi uduk dengan ayam goreng, tempe orek, sambal, dan kerupuk', '2026-05-13 10:59:14', 18, 1, 1),
(9, 'c76e7d61-4eba-11f1-96d0-4ccc6a0144bd', '🍲 Sop Buntut', 65000.00, 'sop-buntut.jpg', 'Sup buntut sapi dengan wortel, kentang, dan tomat, kuah bening', '2026-05-13 10:59:14', 5, 1, 1),
(10, 'c76e7de7-4eba-11f1-96d0-4ccc6a0144bd', '🍛 Nasi Padang', 35000.00, 'nasi-padang.jpg', 'Nasi dengan rendang, ayam pop, sayur nangka, dan sambal hijau', '2026-05-13 10:59:14', 20, 1, 1),
(11, 'c76e7e70-4eba-11f1-96d0-4ccc6a0144bd', '🍹 Es Jeruk Segar', 12000.00, 'es-jeruk.jpg', 'Jeruk peras segar dengan es batu dan gula asli', '2026-05-13 10:59:14', 50, 1, 2),
(12, 'c76e7f2c-4eba-11f1-96d0-4ccc6a0144bd', '🥤 Es Teh Manis', 5000.00, 'es-teh.jpg', 'Teh melati dengan gula asli, disajikan dingin', '2026-05-13 10:59:14', 100, 1, 2),
(13, 'c76e800d-4eba-11f1-96d0-4ccc6a0144bd', '☕ Es Kopi Susu', 18000.00, 'es-kopi.jpg', 'Kopi arabika dengan susu segar dan es batu', '2026-05-13 10:59:14', 40, 1, 2),
(14, 'c76e80f4-4eba-11f1-96d0-4ccc6a0144bd', '🥛 Jus Alpukat', 22000.00, 'jus-alpukat.jpg', 'Jus alpukat dengan susu kental manis dan coklat bubuk', '2026-05-13 10:59:14', 30, 1, 2),
(15, 'c76e8186-4eba-11f1-96d0-4ccc6a0144bd', '🧋 Es Cincau', 15000.00, 'es-cincau.jpg', 'Cincau hitam dengan santan dan gula aren, disajikan dingin', '2026-05-13 10:59:14', 35, 1, 2),
(16, 'c76e820b-4eba-11f1-96d0-4ccc6a0144bd', '🍟 Kentang Goreng', 18000.00, 'kentang-goreng.jpg', 'Kentang goreng crispy dengan saus sambal dan mayonaise', '2026-05-13 10:59:14', 30, 1, 3),
(17, 'c76e82a1-4eba-11f1-96d0-4ccc6a0144bd', '🍗 Chicken Wings', 35000.00, 'chicken-wings.jpg', 'Sayap ayam goreng tepung, saus pedas manis', '2026-05-13 10:59:14', 20, 1, 3),
(18, 'c76e8325-4eba-11f1-96d0-4ccc6a0144bd', '🥟 Pangsit Goreng', 12000.00, 'pangsit.jpg', 'Pangsit isi ayam, goreng crispy', '2026-05-13 10:59:14', 40, 1, 3),
(19, 'c76e83a8-4eba-11f1-96d0-4ccc6a0144bd', '🍤 Udang Goreng Tepung', 28000.00, 'udang-goreng.jpg', 'Udang goreng tepung dengan saus tartar', '2026-05-13 10:59:14', 15, 1, 1),
(20, 'c76e8431-4eba-11f1-96d0-4ccc6a0144bd', '🍣 Cumi Goreng Tepung', 32000.00, 'cumi-goreng.jpg', 'Cumi goreng tepung dengan saus padang', '2026-05-13 10:59:14', 12, 1, 1),
(21, 'c76e850b-4eba-11f1-96d0-4ccc6a0144bd', '🦞 Kepiting Saus Padang', 120000.00, 'kepiting.jpg', 'Kepiting segar dengan saus padang pedas, kaya rempah', '2026-05-13 10:59:14', 5, 1, 1),
(22, 'c76e8664-4eba-11f1-96d0-4ccc6a0144bd', '🐟 Ikan Bakar Rica', 55000.00, 'ikan-bakar.jpg', 'Ikan nila bakar dengan bumbu rica-rica pedas', '2026-05-13 10:59:14', 8, 1, 1),
(23, 'c76e8759-4eba-11f1-96d0-4ccc6a0144bd', '🍲 Seafood Hot Plate', 85000.00, 'seafood-platter.jpg', 'Cumi, udang, kerang, dan ikan dengan saus special', '2026-05-13 10:59:14', 7, 1, 1),
(24, 'c76e8898-4eba-11f1-96d0-4ccc6a0144bd', '🍝 Fettuccine Aglio Olio', 45000.00, 'pasta.jpg', 'Pasta dengan minyak zaitun, bawang putih, dan cabai', '2026-05-13 10:59:14', 10, 1, NULL),
(25, 'c76e8919-4eba-11f1-96d0-4ccc6a0144bd', '🥩 Steak Ayam', 55000.00, 'steak-ayam.jpg', 'Steak ayam dengan saus blackpepper, kentang, dan sayur', '2026-05-13 10:59:14', 10, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `token` varchar(500) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `revoked` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token`, `expires_at`, `revoked`, `created_at`) VALUES
(35, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoidXNlcjJAZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3ODY2NTk1MCwiZXhwIjoxNzgxMjU3OTUwfQ.Qm8ov3V-z0Z4wEBLHMYvPaIdwRuo-Kjjkb9sAgWy_1I', '2026-06-12 09:52:31', 1, '2026-05-13 09:52:30'),
(36, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc4NjY2MjEzLCJleHAiOjE3ODEyNTgyMTN9.LuxUtQQbMp4sGfFalV6OT7x6FgAOtX7VBg39YSd6rp0', '2026-06-12 09:56:54', 1, '2026-05-13 09:56:53'),
(37, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc4NjY3NDEzLCJleHAiOjE3ODEyNTk0MTN9.raqulj5M4m_Fih02ARdlYaIxtuEb9RopBpYjJqG3xWQ', '2026-06-12 10:16:54', 1, '2026-05-13 10:16:53'),
(38, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc4Njc2ODM1LCJleHAiOjE3ODEyNjg4MzV9.zPsY844_H51Crs2CJeD190gMHSA7yZCzBIbtm0BnJ5U', '2026-06-12 12:53:55', 1, '2026-05-13 12:53:55'),
(39, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc4Njc3MDIzLCJleHAiOjE3ODEyNjkwMjN9.W_w9tuUPWMD9E_xsnYso42bVeWMe7qG1C5PYXKmQKfw', '2026-06-12 12:57:04', 1, '2026-05-13 12:57:03'),
(40, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc4Njc4MzQxLCJleHAiOjE3ODEyNzAzNDF9.x-B_niPalzPzkE2XwSRL52OSzjglKwop9_QPVo-8BzQ', '2026-06-12 13:19:02', 1, '2026-05-13 13:19:01'),
(41, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc4Njc5NzM1LCJleHAiOjE3ODEyNzE3MzV9.Eg4FLNjtm8rZv1e6qo55r9ojzgYqiBBExs_E3XKe0lA', '2026-06-12 13:42:16', 1, '2026-05-13 13:42:15'),
(42, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc4Njc5Nzk0LCJleHAiOjE3ODEyNzE3OTR9.yrlInqAi4oLpf_bkwhViP0Hac2OpSklc4dOWxHOvixU', '2026-06-12 13:43:15', 0, '2026-05-13 13:43:14');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `phone` varchar(20) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `bio` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uuid`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`, `phone`, `avatar`, `bio`) VALUES
(1, '28fe47c4-4e99-11f1-96d0-4ccc6a0144bd', 'Admin User', 'admin@example.com', '$2b$10$KquARGSH6c9qd8MIgyKRw.shP2UQZNXdFDxWFIswNEZ5cmN1Dl40G', 'admin', '2026-05-13 06:58:34', '2026-05-13 09:48:51', NULL, NULL, NULL),
(2, 'c116dbff-b90d-4ec8-88f9-d1cb801710e7', 'User 1', 'user@example.com', '$2b$10$KquARGSH6c9qd8MIgyKRw.shP2UQZNXdFDxWFIswNEZ5cmN1Dl40G', 'user', '2026-05-13 07:02:10', '2026-05-13 13:43:45', '081210101010', NULL, 'User 1\n'),
(3, '63923147-0b9c-49a6-a0f4-b48a04da663c', 'Test', 'user2@example.com', '$2b$10$rT5F/50oBiXoXtDOTpXf/u6GKU4WUjtQmNG89YLPLSRSeLS3kHp8u', 'user', '2026-05-13 07:29:23', '2026-05-13 07:29:23', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_addresses`
--

CREATE TABLE `user_addresses` (
  `id` int NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `user_id` int NOT NULL,
  `label` varchar(50) DEFAULT 'Rumah',
  `recipient_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_addresses`
--

INSERT INTO `user_addresses` (`id`, `uuid`, `user_id`, `label`, `recipient_name`, `phone`, `address`, `city`, `postal_code`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 'cbedab6f-f98b-4a03-aefa-ae9eead4d809', 2, 'Rumah', 'User', '081210101010', 'Jl. Beringin No. 7', 'Bekasi', '17530', 1, '2026-05-13 13:44:41', '2026-05-13 13:44:41');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `user_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
