

---

# Full Stack eCommerce Application

This is a robust eCommerce application built using Node.js, Express, jQuery, Bootstrap, Handlebars, and MongoDB. The application features secure authentication, session management, and integrates with Razorpay for payment processing. It supports various functionalities such as product listing, cart management, order processing, and an admin panel for managing products.

## Table of Contents

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Configuration](#configuration)
6. [Admin Panel](#admin-panel)
7. [User Management](#user-management)
8. [Contributing](#contributing)
9. [Contact](#contact)

## Features

- **Product Listing:** Display products available for purchase.
- **Add to Cart:** Users can add items to their shopping cart.
- **Edit & Delete Cart Items:** Modify or remove items from the cart.
- **Order Products:** Users can place orders using various payment options.
- **Order Status:** View the status of orders (e.g., pending, placed).
- **Cash on Delivery (COD) & Online Payments:** Choose between COD and online payments via Razorpay.
- **Admin Panel:** Admins can list, edit, and delete products.
- **User Order Management:** Users can view the status of their orders.
- **Enhanced Admin Table Management:** Admins can now use jQuery DataTables for sorting, searching, and pagination of products.

## Technologies Used

- **Node.js:** JavaScript runtime built on Chrome's V8 engine.
- **Express:** Web application framework for Node.js.
- **jQuery:** JavaScript library for DOM manipulation and AJAX requests.
- **Bootstrap:** Frontend framework for responsive design.
- **Handlebars:** Templating engine for dynamic content rendering.
- **MongoDB:** NoSQL database for storing data.
- **bcrypt:** Library for hashing passwords for secure authentication.
- **Session Management & Cookies:** Handle user sessions and cookies for authentication.
- **Razorpay:** Payment gateway integration for online transactions.
- **AJAX:** Used for asynchronous data fetching and updating parts of the webpage without reloading.
- **DataTables:** jQuery plugin for enhancing HTML tables with features like sorting, searching, and pagination.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/muhammednawaf/full-stack-ecommerce.git
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file and add the following:** 

   ```plaintext
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   SESSION_SECRET=your_session_secret
   ```

4. **Start the application:**

   ```bash
   npm start
   ```

   The application will be accessible at `http://localhost:3000`.

   Note: When you first start the server, there will be no products listed. You will
   need to manually add products through the admin dashboard.

## Usage

- **Homepage:** View the list of available products.
- **Product Details:** Click on a product to view details and add it to your cart.
- **Cart Management:** Access and manage your cart items.
- **Checkout:** Proceed to checkout to place an order. Choose between COD and online payment via Razorpay.
- **Order Status:** Check the status of your orders.


## AJAX Usage
AJAX is used to enhance user experience by enabling dynamic updates:

- **Cart Management:** Adding, editing, and deleting items in the cart is handled asynchronously.
- **Order Processing:** AJAX requests are used to process orders and update order status without page reloads.


## Configuration

- **Razorpay Integration:** Ensure that you have configured your Razorpay credentials. You can obtain these credentials by signing up on [Razorpay](https://razorpay.com/).
- **Session Management:** Configure session secret for secure user session management.

## Admin Panel

Admins can manage products through the admin panel. Access the admin panel at `http://localhost:3000/admin` (authentication required).

- **Add Product:** Form to add new products to the catalog.
- **Edit Product:** Modify details of existing products.
- **Delete Product:** Remove products from the catalog.
- **Enhanced Product Table:** The product table in the admin panel now utilizes jQuery DataTables for sorting, searching, and pagination. This allows for easier management of large product inventories.

## User Management

Users can view their order history and track the status of their orders (e.g., pending, placed) from their account dashboard.

## Contributing

We welcome contributions to this project! To contribute:

## Contact

For any questions or support, please reach out to [nawafsuneer@gmail.com](mailto:nawafsuneer@gmail.com).

---
