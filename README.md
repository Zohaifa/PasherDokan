# 📦 

**PasherDokan** is a hyperlocal e-commerce platform designed to connect shopkeepers and customers within a 2-kilometer radius in Bangladesh. It offers a simple yet powerful tool for local businesses to create online storefronts and reach nearby buyers, with **cash on delivery** as the primary payment method.

---

## 🚀 Project Overview

### 🔍 Problem Statement
In Bangladesh, small shopkeepers often lack digital tools to reach online customers, while buyers struggle to discover nearby stores offering essential goods. Existing platforms (e.g., Daraz, Chaldal) cater to wider markets, missing the **hyperlocal** niche.

### 💡 Solution
PasherDokan enables shopkeepers to register their business for a **one-time fee of 100 Taka** and start selling to customers within a **2km radius**. The app uses location-based services, shop discovery, and cash-on-delivery logistics to bridge the gap between physical and digital commerce.

---

## 🌐 Key Features

### 🛒 For Customers:
- Discover nearby shops based on your GPS location (within 2km).
- Browse shop products with images, prices, and categories.
- Place orders via Cash on Delivery (CoD).
- Save favorite shops for quick access.

### 🧾 For Shopkeepers:
- Register your shop with a 100 Taka fee.
- Upload product details, photos, prices.
- Receive order notifications.
- Mark orders as delivered or pending.
- Track total orders and performance via a dashboard.

### 🔒 Security & Trust:
- CoD minimizes payment risk for users.
- Local-only shop discovery builds buyer trust.
- Ratings and reviews from verified buyers (planned).

---

## 🏗️ System Architecture

```plaintext
            Client (React Native)
                    |
                    v
            API Gateway (Node.js)
                    |
        -------------------------------
        |         |         |         |
    Auth      Location   Orders    Products
    Service   Services   Service   Service
                    |
               MongoDB Atlas
