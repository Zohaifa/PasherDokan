**PasherDokan** is a hyperlocal e-commerce platform designed to connect shopkeepers and customers within a 1-kilometer radius in Bangladesh. It offers a simple yet powerful tool for local businesses to create online storefronts and reach nearby buyers, with **cash on delivery** as the primary payment method.

---

### 🔍 Problem Statement
In Bangladesh, small shopkeepers often lack digital tools to reach online customers, while buyers struggle to discover nearby stores offering essential goods. Existing platforms (e.g., Daraz, Chaldal) cater to wider markets, missing the **hyperlocal** niche.

### 💡 Solution
PasherDokan enables shopkeepers to register their business for a **one-time fee of 100 Taka** and start selling to customers within a **1km radius**. The app uses location-based services, shop discovery, and cash-on-delivery logistics to bridge the gap between physical and digital commerce.

---

## 🏗️ System Architecture

```plaintext
                                Client (React Native)
                                         |
                                         v
                                API Gateway (Node.js)
                                         |
                        --------------------------------------
                        |         |          |         |
                        Auth      Location   Orders    Products
                        Service   Services   Service   Service
                                         |
                                   MongoDB Atlas
