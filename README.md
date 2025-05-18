**PasherDokan**
🛒 *A Hyperlocal E-commerce Platform for Bangladesh*

PasherDokan is an open-source hyperlocal e-commerce platform designed to connect shopkeepers and customers within a 2-kilometer radius in Bangladesh. It empowers local businesses to establish digital storefronts and reach nearby buyers through a user-friendly mobile application, with cash on delivery (CoD) as the primary payment method.

---

### Table of Contents

* Project Overview
* System Architecture
* Repository Structure
* Getting Started

  * Prerequisites
  * Setup
* Contributing
* Development Workflow
* Code Style
* Testing

---

### Project Overview

**Problem Statement**
In Bangladesh, many small shopkeepers lack access to digital tools that would help them reach online customers. Meanwhile, consumers often face difficulty finding nearby shops that offer daily essentials. Most existing e-commerce platforms focus on large-scale markets, overlooking hyperlocal needs.

**Solution**
PasherDokan bridges this gap by providing:

* **Customer Features:**

  * GPS-based shop discovery
  * Product browsing and ordering
  * Cash on delivery support
  * Ability to mark favorites

* **Shopkeeper Features:**

  * Easy store registration with a one-time fee of 100 BDT
  * Product and order management
  * Real-time order notifications
  * Delivery status tracking

* **Trust & Security:**

  * Local-only store discovery
  * Ratings and reviews system
  * Cash on delivery for secure transactions

---

### System Architecture

The system is built on a modular service-based architecture:

* **Client:** React Native Mobile App
* **API Gateway:** Node.js
* **Core Services:**

  * Authentication Service
  * Location Service
  * Orders Service
  * Products Service
* **Database:** MongoDB Atlas

---

### Repository Structure

This repository contains the following projects:

1. `pasherdokan-backend` – Backend services built with Node.js
2. `pasherdokanApp` – Traditional React Native mobile application (not being used) -- Removed
3. `pasherdokanAppFresh` – Modern React Native app using Expo (recommended)

---

### Getting Started

#### Prerequisites

* Node.js (version 14 or later)
* npm or yarn
* Android Studio (for Android development)
* Xcode (for iOS development on macOS)
* MongoDB

#### Setup Instructions

1. **Clone the repository:**

   ```
   git clone https://github.com/ju4700/PasherDokan.git
   cd PasherDokan
   ```

2. **Backend Setup:**

   ```
   cd pasherdokan-backend
   npm install
   # Set up environment variables using .env.example as a template
   npm run dev
   ```

3. **Mobile App Setup (Recommended: `pasherdokanAppFresh`):**

   ```
   cd pasherdokanAppFresh
   npm install
   npx expo run:android
   ```

---

### Contributing

Here's how you can get involved:

1. Browse the issues and find one that interests you
2. Fork the repository
3. Create a new branch for your feature

   ```
   git checkout -b feature/your-feature-name
   ```
4. Make and commit your changes
5. Run the tests to ensure everything works as expected
6. Submit a pull request with a clear description of your changes

#### Getting All Branches from Upstream

To fetch all branches from the upstream repository:

```
# Add the upstream remote
git remote add upstream https://github.com/ju4700/PasherDokan.git

# Fetch all branches
git fetch upstream

# Create local branches tracking all upstream branches
git for-each-ref refs/remotes/upstream --format='%(refname:short)' | \
sed 's|upstream/||' | grep -v "HEAD\|master\|main" | \
xargs -I{} git checkout -b {} upstream/{}
```

---

### Development Workflow

1. Pull the latest changes from the `main` branch
2. Create a new feature branch
3. Make and commit your changes
4. Test everything locally
5. Submit a pull request for review
6. Once approved, merge it into the `development/alpha` branch

---

### Code Style

* Follow the project's `.eslintrc.js` rules
* Use TypeScript to ensure type safety
* Maintain consistency with the existing architecture

---

### Testing

**Backend Testing:**

```
cd pasherdokan-backend
npm test
```

**Mobile App Testing:**

```
cd pasherdokanAppFresh
npm test
```

---