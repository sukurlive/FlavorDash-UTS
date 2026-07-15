-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 15, 2026 at 08:55 PM
-- Server version: 8.0.30
-- PHP Version: 8.3.31

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
  `address_id` int DEFAULT NULL,
  `order_number` varchar(50) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `status` enum('pending','processing','completed','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `proof_image` varchar(255) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `uuid`, `user_id`, `address_id`, `order_number`, `total_amount`, `status`, `payment_method`, `proof_image`, `notes`, `created_at`, `updated_at`) VALUES
(1, '925f7ef9-b164-44c8-bb50-91a789af54ad', 2, 1, 'ORD-1784121159197-189', 35000.00, 'processing', 'cod', NULL, '', '2026-07-15 13:12:39', '2026-07-15 20:02:53'),
(2, 'ac0868ee-60d0-4b43-85d4-85356ab0f84a', 2, 1, 'ORD-1784121246712-896', 55000.00, 'processing', 'transfer', NULL, '', '2026-07-15 13:14:06', '2026-07-15 20:02:58'),
(3, '00910f64-4332-4f9e-a1a8-8f467a6c2ffd', 2, 1, 'ORD-1784121676095-297', 32000.00, 'completed', 'cod', '/uploads/proof-1784143935762-718471330.jpg', '', '2026-07-15 13:21:16', '2026-07-15 20:03:03'),
(4, 'e5e30a00-47c0-4363-8b06-fc5c7dac6446', 2, 1, 'ORD-1784143031216-378', 60000.00, 'completed', 'transfer', '/uploads/proof-1784144172179-27273101.jpg', '', '2026-07-15 19:17:11', '2026-07-15 20:03:05'),
(5, '9442a128-a8c3-4a31-b925-0800eaa6bb64', 2, 1, 'ORD-1784145432367-914', 58000.00, 'processing', 'transfer', NULL, '', '2026-07-15 19:57:12', '2026-07-15 20:03:11');

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

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `uuid`, `order_id`, `product_id`, `quantity`, `price`, `subtotal`, `created_at`) VALUES
(12, 'c8944ad2-50bb-45b4-bcb9-12525415d55a', 1, 1, 1, 35000.00, 35000.00, '2026-07-15 13:12:39'),
(13, '133b26d3-9a63-48ac-9594-3784c2b8efe3', 2, 22, 1, 55000.00, 55000.00, '2026-07-15 13:14:06'),
(14, '2118f08c-8282-4640-a48b-749a958bae5d', 3, 20, 1, 32000.00, 32000.00, '2026-07-15 13:21:16'),
(15, 'afa66c81-763c-4624-8b7d-6b0ccd7fde43', 4, 1, 1, 35000.00, 35000.00, '2026-07-15 19:17:11'),
(16, 'ebbb50d2-14ff-40a1-b629-a0912e407081', 4, 2, 1, 25000.00, 25000.00, '2026-07-15 19:17:11'),
(17, '67a321ef-c85b-4918-9711-057958de3ac0', 5, 1, 1, 35000.00, 35000.00, '2026-07-15 19:57:12'),
(18, '36bcd7b4-22a4-4c95-b224-a892f082ac05', 5, 12, 1, 5000.00, 5000.00, '2026-07-15 19:57:12'),
(19, '269b95ef-42ea-43be-a116-5af614dacb00', 5, 16, 1, 18000.00, 18000.00, '2026-07-15 19:57:12');

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
(1, 'c76e7062-4eba-11f1-96d0-4ccc6a0144bd', '🍛 Nasi Goreng Spesial Joss', 35000.00, NULL, 'Nasi goreng dengan telur mata sapi, ayam suwir, kerupuk, dan acar', '2026-05-13 10:59:14', 17, 1, 1),
(2, 'c76e779b-4eba-11f1-96d0-4ccc6a0144bd', '🍜 Mie Ayam Jamur', 25000.00, 'mie-ayam.jpg', 'Mie ayam dengan topping jamur, pangsit goreng, bakso, dan sawi', '2026-05-13 10:59:14', 14, 1, 1),
(3, 'c76e7930-4eba-11f1-96d0-4ccc6a0144bd', '🍢 Sate Ayam Madura', 40000.00, 'sate-ayam.jpg', '10 tusuk sate ayam dengan bumbu kacang, lontong, dan kecap', '2026-05-13 10:59:14', 10, 1, 1),
(4, 'c76e7a37-4eba-11f1-96d0-4ccc6a0144bd', '🥘 Rendang Padang', 45000.00, NULL, 'Daging sapi dimasak dengan bumbu rendang khas Padang, empuk dan pedas', '2026-05-13 10:59:14', 9, 1, 1),
(5, 'c76e7ac9-4eba-11f1-96d0-4ccc6a0144bd', '🥗 Gado-Gado', 28000.00, 'gado-gado.jpg', 'Sayuran rebus dengan bumbu kacang, kerupuk, dan telur', '2026-05-13 10:59:14', 25, 1, 1),
(6, 'c76e7b57-4eba-11f1-96d0-4ccc6a0144bd', '🍲 Rawon Surabaya', 38000.00, 'rawon.jpg', 'Sup daging hitam khas Surabaya dengan kluwek, telur asin, dan tauge', '2026-05-13 10:59:14', 12, 1, 1),
(7, 'c76e7bdd-4eba-11f1-96d0-4ccc6a0144bd', '🍗 Ayam Bakar Madura', 42000.00, 'ayam-bakar.jpg', 'Ayam bakar dengan bumbu madura, sambal terasi, dan lalapan', '2026-05-13 10:59:14', 10, 1, 1),
(8, 'c76e7cd4-4eba-11f1-96d0-4ccc6a0144bd', '🍚 Nasi Uduk Komplit', 30000.00, 'nasi-uduk.jpg', 'Nasi uduk dengan ayam goreng, tempe orek, sambal, dan kerupuk', '2026-05-13 10:59:14', 18, 1, 1),
(9, 'c76e7d61-4eba-11f1-96d0-4ccc6a0144bd', '🍲 Sop Buntut', 65000.00, 'sop-buntut.jpg', 'Sup buntut sapi dengan wortel, kentang, dan tomat, kuah bening', '2026-05-13 10:59:14', 5, 1, 1),
(10, 'c76e7de7-4eba-11f1-96d0-4ccc6a0144bd', '🍛 Nasi Padang', 35000.00, 'nasi-padang.jpg', 'Nasi dengan rendang, ayam pop, sayur nangka, dan sambal hijau', '2026-05-13 10:59:14', 20, 1, 1),
(11, 'c76e7e70-4eba-11f1-96d0-4ccc6a0144bd', '🍹 Es Jeruk Segar', 12000.00, 'es-jeruk.jpg', 'Jeruk peras segar dengan es batu dan gula asli', '2026-05-13 10:59:14', 50, 1, 2),
(12, 'c76e7f2c-4eba-11f1-96d0-4ccc6a0144bd', '🥤 Es Teh Manis', 5000.00, 'es-teh.jpg', 'Teh melati dengan gula asli, disajikan dingin', '2026-05-13 10:59:14', 99, 1, 2),
(13, 'c76e800d-4eba-11f1-96d0-4ccc6a0144bd', '☕ Es Kopi Susu', 18000.00, 'es-kopi.jpg', 'Kopi arabika dengan susu segar dan es batu', '2026-05-13 10:59:14', 40, 1, 2),
(14, 'c76e80f4-4eba-11f1-96d0-4ccc6a0144bd', '🥛 Jus Alpukat', 22000.00, 'jus-alpukat.jpg', 'Jus alpukat dengan susu kental manis dan coklat bubuk', '2026-05-13 10:59:14', 30, 1, 2),
(15, 'c76e8186-4eba-11f1-96d0-4ccc6a0144bd', '🧋 Es Cincau', 15000.00, 'es-cincau.jpg', 'Cincau hitam dengan santan dan gula aren, disajikan dingin', '2026-05-13 10:59:14', 35, 1, 2),
(16, 'c76e820b-4eba-11f1-96d0-4ccc6a0144bd', '🍟 Kentang Goreng', 18000.00, 'kentang-goreng.jpg', 'Kentang goreng crispy dengan saus sambal dan mayonaise', '2026-05-13 10:59:14', 29, 1, 3),
(17, 'c76e82a1-4eba-11f1-96d0-4ccc6a0144bd', '🍗 Chicken Wings', 35000.00, 'chicken-wings.jpg', 'Sayap ayam goreng tepung, saus pedas manis', '2026-05-13 10:59:14', 20, 1, 3),
(18, 'c76e8325-4eba-11f1-96d0-4ccc6a0144bd', '🥟 Pangsit Goreng', 12000.00, 'pangsit.jpg', 'Pangsit isi ayam, goreng crispy', '2026-05-13 10:59:14', 40, 1, 3),
(19, 'c76e83a8-4eba-11f1-96d0-4ccc6a0144bd', '🍤 Udang Goreng Tepung', 28000.00, 'udang-goreng.jpg', 'Udang goreng tepung dengan saus tartar', '2026-05-13 10:59:14', 15, 1, 1),
(20, 'c76e8431-4eba-11f1-96d0-4ccc6a0144bd', '🍣 Cumi Goreng Tepung', 32000.00, 'cumi-goreng.jpg', 'Cumi goreng tepung dengan saus padang', '2026-05-13 10:59:14', 11, 1, 1),
(21, 'c76e850b-4eba-11f1-96d0-4ccc6a0144bd', '🦞 Kepiting Saus Padang', 120000.00, 'kepiting.jpg', 'Kepiting segar dengan saus padang pedas, kaya rempah', '2026-05-13 10:59:14', 5, 1, 1),
(22, 'c76e8664-4eba-11f1-96d0-4ccc6a0144bd', '🐟 Ikan Bakar Rica', 55000.00, 'ikan-bakar.jpg', 'Ikan nila bakar dengan bumbu rica-rica pedas', '2026-05-13 10:59:14', 7, 1, 1),
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
(36, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc4NjY2MjEzLCJleHAiOjE3ODEyNTgyMTN9.LuxUtQQbMp4sGfFalV6OT7x6FgAOtX7VBg39YSd6rp0', '2026-06-12 09:56:54', 1, '2026-05-13 09:56:53'),
(37, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc4NjY3NDEzLCJleHAiOjE3ODEyNTk0MTN9.raqulj5M4m_Fih02ARdlYaIxtuEb9RopBpYjJqG3xWQ', '2026-06-12 10:16:54', 1, '2026-05-13 10:16:53'),
(38, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc4Njc2ODM1LCJleHAiOjE3ODEyNjg4MzV9.zPsY844_H51Crs2CJeD190gMHSA7yZCzBIbtm0BnJ5U', '2026-06-12 12:53:55', 1, '2026-05-13 12:53:55'),
(39, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc4Njc3MDIzLCJleHAiOjE3ODEyNjkwMjN9.W_w9tuUPWMD9E_xsnYso42bVeWMe7qG1C5PYXKmQKfw', '2026-06-12 12:57:04', 1, '2026-05-13 12:57:03'),
(40, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc4Njc4MzQxLCJleHAiOjE3ODEyNzAzNDF9.x-B_niPalzPzkE2XwSRL52OSzjglKwop9_QPVo-8BzQ', '2026-06-12 13:19:02', 1, '2026-05-13 13:19:01'),
(41, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc4Njc5NzM1LCJleHAiOjE3ODEyNzE3MzV9.Eg4FLNjtm8rZv1e6qo55r9ojzgYqiBBExs_E3XKe0lA', '2026-06-12 13:42:16', 1, '2026-05-13 13:42:15'),
(42, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc4Njc5Nzk0LCJleHAiOjE3ODEyNzE3OTR9.yrlInqAi4oLpf_bkwhViP0Hac2OpSklc4dOWxHOvixU', '2026-06-12 13:43:15', 0, '2026-05-13 13:43:14'),
(43, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTIwNDgwLCJleHAiOjE3ODY3MTI0ODB9.1yG2b4qPItudJZGRM_CKS76DxRhvxSLDgwXk0QtenAA', '2026-08-14 13:01:21', 1, '2026-07-15 13:01:20'),
(44, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTIxMTI0LCJleHAiOjE3ODY3MTMxMjR9.4n9psYueGAUywpRnsUE4o0ofKxx-VO0L0gFuma6GRdM', '2026-08-14 13:12:05', 1, '2026-07-15 13:12:04'),
(45, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEyMTU0MiwiZXhwIjoxNzg2NzEzNTQyfQ.0FUERE99HGVbACAPp5xaTZ1Xcmn1ljK-TrjbDDIeX5A', '2026-08-14 13:19:02', 1, '2026-07-15 13:19:02'),
(46, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTIxNjQxLCJleHAiOjE3ODY3MTM2NDF9.iTIeh8Fjz8_lbaffRNP7d7ob3PuIQLzSYM-RfaiCVf4', '2026-08-14 13:20:42', 1, '2026-07-15 13:20:41'),
(47, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEyMjUxMiwiZXhwIjoxNzg2NzE0NTEyfQ.ZFNvpDuhP1tozL-orDYuz1EwzoUmi3grGQysNezPxPM', '2026-08-14 13:35:13', 1, '2026-07-15 13:35:12'),
(48, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEyMjc3MiwiZXhwIjoxNzg2NzE0NzcyfQ.ike2AQ7hjEcWxgGiXnbt5W33F1fLNeVX2hFJrvplIJ4', '2026-08-14 13:39:33', 1, '2026-07-15 13:39:32'),
(49, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEyMzAyNSwiZXhwIjoxNzg2NzE1MDI1fQ.5WBJLmRkg4J953BwvfhgSJ-keQ_8o9iZ0Fv2voRU_qk', '2026-08-14 13:43:45', 1, '2026-07-15 13:43:45'),
(50, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTIzMDc0LCJleHAiOjE3ODY3MTUwNzR9.i9zUYS2CF3rozogBKJQC08HdK4ai1UTo7ns17OS40ag', '2026-08-14 13:44:34', 1, '2026-07-15 13:44:34'),
(51, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEyMzIxNiwiZXhwIjoxNzg2NzE1MjE2fQ.IFaCXocxtgndaauek4rqsI52k3kUq9O9YMwQ3q9Mddc', '2026-08-14 13:46:56', 1, '2026-07-15 13:46:56'),
(52, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTIzNDg1LCJleHAiOjE3ODY3MTU0ODV9.9h39eprnZuDmly62WSgxaYhRJG_Y1WYvpkBSbfeUCxM', '2026-08-14 13:51:26', 1, '2026-07-15 13:51:25'),
(53, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEyMzYzNiwiZXhwIjoxNzg2NzE1NjM2fQ.Ay1owzMNhsqACcMwHt_NrQ58tvCi85fo7_ZuiuIU7-0', '2026-08-14 13:53:56', 1, '2026-07-15 13:53:56'),
(54, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTI0NzExLCJleHAiOjE3ODY3MTY3MTF9.7Dfg_5NQdpW8Rhf905tEWwYTlDo4nAhhlIQRxM2P33E', '2026-08-14 14:11:52', 1, '2026-07-15 14:11:51'),
(55, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTI1MTg3LCJleHAiOjE3ODY3MTcxODd9.7tM3LieCJSktFFQ7zrM4WPnDGojUyBrapw_-RV6W5ho', '2026-08-14 14:19:48', 1, '2026-07-15 14:19:47'),
(56, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTI1MjkwLCJleHAiOjE3ODY3MTcyOTB9.6HZUgnXweSLdtT4IegKhtVJrQdyO3SEirdl5BK2QOBo', '2026-08-14 14:21:31', 1, '2026-07-15 14:21:30'),
(57, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEyNTM3MSwiZXhwIjoxNzg2NzE3MzcxfQ.5JFvgKUc1UbAejEpzLATCPgH2cOs9VQ0yJOQosg21HA', '2026-08-14 14:22:51', 1, '2026-07-15 14:22:51'),
(58, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTI1ODQ3LCJleHAiOjE3ODY3MTc4NDd9.zq7Ul764EBUxhZqKTjU86LdyJGIYIE2EvLIg1Rt0pJY', '2026-08-14 14:30:48', 1, '2026-07-15 14:30:47'),
(59, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEyNjExMiwiZXhwIjoxNzg2NzE4MTEyfQ.h3Mf89PYK6-lmcQqdKXWTXBFKib-7u5RU0CzZXGr8dc', '2026-08-14 14:35:12', 1, '2026-07-15 14:35:12'),
(60, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEyNjY0OSwiZXhwIjoxNzg2NzE4NjQ5fQ.YQKIQKT8CYR2kIYlWwFWRQOR26zvsfC_UqUtViJQaZs', '2026-08-14 14:44:09', 1, '2026-07-15 14:44:09'),
(61, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTI3OTQzLCJleHAiOjE3ODY3MTk5NDN9.x1hFrvBG3T9uaMIpbPMPvraFrACERPxvobvwnajnhkc', '2026-08-14 15:05:43', 1, '2026-07-15 15:05:43'),
(62, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEyODM4NSwiZXhwIjoxNzg2NzIwMzg1fQ.NxG-8qeKKCTl6ohWoB7m69ckqcAOOxNAsyderw4crp0', '2026-08-14 15:13:05', 1, '2026-07-15 15:13:05'),
(63, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTI4NjAxLCJleHAiOjE3ODY3MjA2MDF9.n6Jdzs3lhnpb-74ZOkrxOBy62VPYphFngB_fApEftnE', '2026-08-14 15:16:41', 1, '2026-07-15 15:16:41'),
(64, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEyOTA3NSwiZXhwIjoxNzg2NzIxMDc1fQ.w1mux_oN5K0HvxIeoa7bTvghJhAHaoiroOt_3bH3NAI', '2026-08-14 15:24:36', 1, '2026-07-15 15:24:35'),
(65, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEyOTEyNywiZXhwIjoxNzg2NzIxMTI3fQ.vbvYBYWIEK4VHeS-bdXjtr5-BQBfhUeBuY7aWKBBRJc', '2026-08-14 15:25:27', 1, '2026-07-15 15:25:27'),
(66, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEzMTUyMywiZXhwIjoxNzg2NzIzNTIzfQ.IhzHnCtFaKzQY-e3gc2Wnb5PzmSXx0xwLV2r6ty-GXY', '2026-08-14 16:05:24', 1, '2026-07-15 16:05:23'),
(67, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEzMzE5MCwiZXhwIjoxNzg2NzI1MTkwfQ.Q4DdXVVFfu82u28ODBhLiJWTEmdJoqZ22Bed1DsAHfg', '2026-08-14 16:33:10', 1, '2026-07-15 16:33:10'),
(68, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTM0MTM2LCJleHAiOjE3ODY3MjYxMzZ9.EflRitovNHSHipFHveWak6vRmeLzrWWEOPdQwofIXgY', '2026-08-14 16:48:56', 1, '2026-07-15 16:48:56'),
(69, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEzNDE4OCwiZXhwIjoxNzg2NzI2MTg4fQ.IagPjQyA6VgHwOPdPCWd-tWlUX7DFGKbPkrFePZILjA', '2026-08-14 16:49:49', 1, '2026-07-15 16:49:48'),
(70, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEzNTQ4NCwiZXhwIjoxNzg2NzI3NDg0fQ.94PNbGGA7UVCsZH0ZcYieSUxq3-Q0guEKTAluMdDeWQ', '2026-08-14 17:11:25', 1, '2026-07-15 17:11:24'),
(71, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEzNTgxMCwiZXhwIjoxNzg2NzI3ODEwfQ.Kx4vMTtlS_h6byxyIyb7UMZsO8LmaY1c5YpIIcEj02o', '2026-08-14 17:16:50', 1, '2026-07-15 17:16:50'),
(72, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTM2MjQ4LCJleHAiOjE3ODY3MjgyNDh9.aKbe9AoYCbiFYkE3ZQSe0u4Zgo8eCEH5OislrcwvDRY', '2026-08-14 17:24:08', 1, '2026-07-15 17:24:08'),
(73, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTM2MzQ5LCJleHAiOjE3ODY3MjgzNDl9.vN5Ggdn3tn7LrMRt8dPDf5uwq4vCmPWPzbo21z5eaes', '2026-08-14 17:25:49', 1, '2026-07-15 17:25:49'),
(74, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEzNjM3MywiZXhwIjoxNzg2NzI4MzczfQ.E62CDt6nRxkpVg2Fnnn9eI8E8HY6Dby6l317XiqPLjA', '2026-08-14 17:26:14', 1, '2026-07-15 17:26:13'),
(75, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTM2NzUyLCJleHAiOjE3ODY3Mjg3NTJ9.RwILgVyVHsGyI_Ee92lUO-0cJRrElGI2iEvdxSxNRPc', '2026-08-14 17:32:33', 1, '2026-07-15 17:32:32'),
(76, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEzNzA2MiwiZXhwIjoxNzg2NzI5MDYyfQ.gqaxLrQnHmOCGWv5ZxX5ubb90TlTbL322wuVw3yT2wc', '2026-08-14 17:37:42', 1, '2026-07-15 17:37:42'),
(77, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTM3NjcwLCJleHAiOjE3ODY3Mjk2NzB9._P9HYLlSnMpdNFwcxeX-vZ_7pjtH1M4fLz16Y9spFfM', '2026-08-14 17:47:50', 1, '2026-07-15 17:47:50'),
(78, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEzODIwMCwiZXhwIjoxNzg2NzMwMjAwfQ.oBlfDZKtVsOdJrpPxIiAT9t1KTVDd_IwaQ5CcFU2HiE', '2026-08-14 17:56:40', 1, '2026-07-15 17:56:40'),
(79, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEzODg5NCwiZXhwIjoxNzg2NzMwODk0fQ.XA3aQvPX7Jtclps-VuwwHN5HeZ0gJuvrANE4hKT3FRY', '2026-08-14 18:08:14', 1, '2026-07-15 18:08:14'),
(80, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDEzOTMxMiwiZXhwIjoxNzg2NzMxMzEyfQ.6zWFyzK629g-DMn_1DE1gukL_nruLietiq1bIFfGM_4', '2026-08-14 18:15:12', 1, '2026-07-15 18:15:12'),
(81, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDE0MDc4MiwiZXhwIjoxNzg2NzMyNzgyfQ.H3flLTs4XhXuWxaXzh-UCq7WvKlqnNVkSY9xs-YbFLg', '2026-08-14 18:39:43', 1, '2026-07-15 18:39:42'),
(82, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTQwOTQ4LCJleHAiOjE3ODY3MzI5NDh9.WNS9yUi-qWDiUVWikq5tqck3J2HEVwqeBPkPYQ-CTe0', '2026-08-14 18:42:29', 1, '2026-07-15 18:42:28'),
(83, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDE0MTI1MywiZXhwIjoxNzg2NzMzMjUzfQ.pusyhKwvyUNEwUPVmOovdQifwaOhkY9IsYNjnRtJEx0', '2026-08-14 18:47:33', 1, '2026-07-15 18:47:33'),
(84, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDE0MTgxNywiZXhwIjoxNzg2NzMzODE3fQ.XB5H1PDqLbPU4Ph92199FB8LNnrJzXYIY5HPE4Y2d5I', '2026-08-14 18:56:57', 1, '2026-07-15 18:56:57'),
(85, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTQyODUzLCJleHAiOjE3ODY3MzQ4NTN9.bsPbNzxwHABqkaeheO33B55N_A5vLqLPDn7I8sWx3MA', '2026-08-14 19:14:13', 1, '2026-07-15 19:14:13'),
(86, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDE0NDA1OCwiZXhwIjoxNzg2NzM2MDU4fQ.oNjc1EWDBNGOH9_K0tRt82hPGae-CBXsFC-gcMGB1T4', '2026-08-14 19:34:18', 1, '2026-07-15 19:34:18'),
(87, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTQ0MTA4LCJleHAiOjE3ODY3MzYxMDh9.6Y5ojJgvjcSngHQUhFO8QHGQ4F2FubaN1CCbyWztZI0', '2026-08-14 19:35:08', 1, '2026-07-15 19:35:08'),
(88, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDE0NTU2MywiZXhwIjoxNzg2NzM3NTYzfQ.mtPPAenWJSHfHjFDr5er_zWrzou0QIcthAYF9CRF-ww', '2026-08-14 19:59:24', 1, '2026-07-15 19:59:23'),
(89, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTQ1NTg5LCJleHAiOjE3ODY3Mzc1ODl9.fqrPjnU4BSwxk8NXkma_x1KnHnxaUMpddOLMdW8tyiE', '2026-08-14 19:59:50', 1, '2026-07-15 19:59:49'),
(90, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTQ3MzcwLCJleHAiOjE3ODY3MzkzNzB9.Esd6_yZS4ZlY9CRQUUBIl5-Od253X6qbLFNs2bcwD6s', '2026-08-14 20:29:31', 0, '2026-07-15 20:29:30'),
(91, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzg0MTQ3NDI0LCJleHAiOjE3ODY3Mzk0MjR9.6Oou2Zi8phDnuE5EUzG321ePdvBjEh5xIbGeYLtzPZo', '2026-08-14 20:30:24', 1, '2026-07-15 20:30:24'),
(92, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NDE0NzQ4OCwiZXhwIjoxNzg2NzM5NDg4fQ.ybcN3DpBvS4cAvIQOJZnv9FJWJnHgCaNUYko8Fyl-I4', '2026-08-14 20:31:28', 0, '2026-07-15 20:31:28');

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
(1, '28fe47c4-4e99-11f1-96d0-4ccc6a0144bd', 'Administrator', 'admin@example.com', '$2b$10$KquARGSH6c9qd8MIgyKRw.shP2UQZNXdFDxWFIswNEZ5cmN1Dl40G', 'admin', '2026-05-13 06:58:34', '2026-07-15 19:08:53', '081212345678', NULL, NULL),
(2, 'c116dbff-b90d-4ec8-88f9-d1cb801710e7', 'User', 'user@example.com', '$2b$10$KquARGSH6c9qd8MIgyKRw.shP2UQZNXdFDxWFIswNEZ5cmN1Dl40G', 'user', '2026-05-13 07:02:10', '2026-07-15 19:08:30', '081210101010', NULL, NULL);

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
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_addresses`
--

INSERT INTO `user_addresses` (`id`, `uuid`, `user_id`, `label`, `recipient_name`, `phone`, `address`, `city`, `postal_code`, `latitude`, `longitude`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 'cbedab6f-f98b-4a03-aefa-ae9eead4d809', 2, 'Rumah', 'User', '081210101010', 'Jl. Beringin No. 7', 'Bekasi', '17530', -6.33995840, 107.08349530, 1, '2026-05-13 13:44:41', '2026-07-15 20:31:04');

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
  ADD KEY `user_id` (`user_id`),
  ADD KEY `address_id` (`address_id`);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `user_addresses` (`id`) ON DELETE SET NULL;

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
