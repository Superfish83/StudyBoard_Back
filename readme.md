# README: API Endpoints and Documentation

This document outlines the API endpoints, including their methods, input parameters, and expected outputs.

---

## 1. Root Endpoints
### **GET /**
- **Input**: None
- **Output**: Renders the index page.

### **POST /**
- **Input**: JSON body (arbitrary)
- **Output**: Response with `success` message and HTTP 200 status.

---

## 2. User System
### **GET /login/google**
- **Input**: None
- **Output**: Redirects to Google OAuth URL.

### **GET /login/google/callback**
- **Input**:
  - Query parameter: `code` (string, required).
- **Output**:
  - On success: Sets a cookie (`token`) and redirects to a specified or default page.
  - On failure: Redirects to `/register` or `/`.

### **POST /register**
- **Input**:
  - Body:
    - `email` (string, required)
    - `phone` (string, required)
    - `name` (string, required)
- **Output**:
  - Success: HTTP 201 with user data.
  - Failure: HTTP 400 with error message.

### **POST /api/userinfo**
- **Input**:
  - Cookie: `token` (JWT, required).
- **Output**:
  - Success: HTTP 200 with user data.
  - Failure: HTTP 401/404 with error message.

---

## 3. Order System
### **POST /api/order/create**
- **Input**:
  - Body:
    - `store_id` (string, required)
    - `price` (number, required)
    - `content` (string, required)
- **Output**:
  - Success: HTTP 201 with `order_id`.
  - Failure: HTTP 400/404/500 with error message.

### **POST /api/order/payment**
- **Input**:
  - Body:
    - `order_id` (string, required)
    - `redirect_to` (string, required)
- **Output**:
  - Success: HTTP 200 with payment token.
  - Failure: HTTP 400/404/403/500 with error message.

### **GET /api/order/payment**
- **Input**:
  - Query parameter: `token` (string, required).
- **Output**:
  - Redirects to the payment URL.
  - Failure: HTTP 400/500 with error message.

### **POST /api/order/get**
- **Input**:
  - Body:
    - `order_id` (string, required).
- **Output**:
  - Success: HTTP 200 with order details.
  - Failure: HTTP 400/404 with error message.

---

## 4. Info System
### **GET /api/getbanner**
- **Input**: None
- **Output**:
  - Success: HTTP 200 with a list of banners.
  - Failure: None specified.

### **GET /api/getproduct**
- **Input**:
  - Query parameter: `PROD_CD` (optional).
- **Output**:
  - Success: HTTP 200 with product information.
  - Failure: HTTP 500 with error message.

---

## 5. Admin System
### **POST /admin/banner/upload**
- **Input**:
  - Body:
    - `title` (string, required)
    - `start_date` (string, optional, defaults to -1)
    - `end_date` (string, optional, defaults to -1)
    - `image` (file, required)
- **Output**:
  - Success: HTTP 201 with banner data.
  - Failure: HTTP 400/500 with error message.

### **POST /admin/product/set**
- **Input**:
  - Body:
    - `PROD_CD` (string, required).
    - `image_loc` (string, optional).
    - `explain` (string, optional).
- **Output**:
  - Success: HTTP 200 with success message.
  - Failure: HTTP 400/500 with error message.

---

## 6. Test Endpoints
### **GET /test/***
- **Input**: None
- **Output**: Renders respective test pages:
  - `/test/login`
  - `/test/register`
  - `/test/getUserInfo`
  - `/test/getBanner`
  - `/test/uploadBanner`
  - `/test/createOrder`
  - `/test/requestPay`
  - `/test/applyPointToOrder`

---