# README: API Endpoints and Documentation

This document outlines the API endpoints, including their methods, input parameters, and expected outputs.

Crosed out endpoints are in development.

---

## 1. User System

### **GET /login/google**

-   **Input**: None
-   **Output**: Redirects to Google OAuth URL.

### **GET /login/google/callback**

-   **Input**:
    -   Query parameter: `code` (string, required).
-   **Output**:
    -   On success: Sets a cookie (`token`) and redirects to a specified or default page.
    -   On failure: Redirects to `/register` or `/`.

### **POST /api/register**

-   **Input**:
    -   Body:
        -   `email` (string, required)
        -   `pw` (string, required)
        -   `name` (string, required)
-   **Output**:
    -   Success: HTTP 201 with user data.
    -   Failure: HTTP 400 with error message.

### **POST /api/userinfo**

-   **Input**:
    -   Cookie: `token` (JWT, required).
-   **Output**:
    -   Success: HTTP 200 with user data.
    -   Failure: HTTP 401/404 with error message.

---

## 2. Studyroom System

### **GET /api/room/search**

-   **Input**

    -   Query Parameter: `keyword` (string, optional)

-   **Output**
    -   Success: HTTP 200 with ~~list of rooms `[ { id, name, description } ]`~~. TODO: implement search.
    -   Failure: HTTP 404 with error message.

---

### **POST /api/room/create**

-   **Input**

    -   Cookie: `token` (JWT, required)
    -   Body: `{ name: string, description: string }` (required)

-   **Output**
    -   Success: HTTP 201 with room data `{ id, name, description, created_at, updated_at }`.
    -   Failure: HTTP 401/400 with error message.

---

### **GET /api/room/[id]**

-   **Input**
    -   Cookie: `token` (JWT, required)
-   **Output**
    -   Success: HTTP 200 with room data `{ id, name, description, createdAt , updated_at}`.
    -   Failure: HTTP 401/404 with error message.

### **PATCH /api/room/[id]**

-   **Input**

    -   Cookie: `token` (JWT, required)
    -   Body: `{ name?: string, description?: string }` (at least one field required)

-   **Output**
    -   Success: HTTP 200 with updated room data `{ id, name, description, createdAt , updated_at }`.
    -   Failure: HTTP 401/404/400 with error message.

### **DELETE /api/room/[id]**

-   **Input**

    -   Cookie: `token` (JWT, required)

-   **Output**
    -   Success: HTTP 200 with confirmation message `{ message: 'Room deleted successfully' }`.
    -   Failure: HTTP 401/404/400 with error message.

---

### ~~**GET /api/room/[id]/resource**~~

-   **Input**

    -   Cookie: `token` (JWT, required)

-   **Output**
    -   Success: HTTP 200 with resource data `{ id, roomId, resourceName, resourceType, createdAt, updated_at }`.
    -   Failure: HTTP 401/404 with error message.

---

### ~~**POST /api/room/[id]/resource/create**~~

-   **Input**

    -   Cookie: `token` (JWT, required)
    -   Body: `{ resourceName: string, resourceType: string }` (required)

-   **Output**
    -   Success: HTTP 201 with created resource data `{ id, roomId, resourceName, resourceType, createdAt , updated_at }`.
    -   Failure: HTTP 401/400 with error message.

---

### ~~**PUT /api/room/[id]/resource/[resourceId]/update**~~

-   **Input**

    -   Cookie: `token` (JWT, required)
    -   Body: `{ resourceName?: string, resourceType?: string }` (at least one field required)

-   **Output**
    -   Success: HTTP 200 with updated resource data `{ id, roomId, resourceName, resourceType, createdAt , updated_at }`.
    -   Failure: HTTP 401/404/400 with error message.

---

### ~~**DELETE /api/room/[id]/resource/[resourceId]/delete**~~

-   **Input**

    -   Cookie: `token` (JWT, required)

-   **Output**
    -   Success: HTTP 200 with confirmation message `{ message: 'Resource deleted successfully' }`.
    -   Failure: HTTP 401/404/400 with error message.

---

## Root Endpoints [NOT USED]

### **GET /**

-   **Input**: None
-   **Output**: Renders the index page.

### **POST /**

-   **Input**: JSON body (arbitrary)
-   **Output**: Response with `success` message and HTTP 200 status.

---

## Order System [NOT USED]

### **POST /api/order/create**

-   **Input**:
    -   Body:
        -   `store_id` (string, required)
        -   `price` (number, required)
        -   `content` (string, required)
-   **Output**:
    -   Success: HTTP 201 with `order_id`.
    -   Failure: HTTP 400/404/500 with error message.

### **POST /api/order/payment**

-   **Input**:
    -   Body:
        -   `order_id` (string, required)
        -   `redirect_to` (string, required)
-   **Output**:
    -   Success: HTTP 200 with payment token.
    -   Failure: HTTP 400/404/403/500 with error message.

### **GET /api/order/payment**

-   **Input**:
    -   Query parameter: `token` (string, required).
-   **Output**:
    -   Redirects to the payment URL.
    -   Failure: HTTP 400/500 with error message.

### **POST /api/order/get**

-   **Input**:
    -   Body:
        -   `order_id` (string, required).
-   **Output**:
    -   Success: HTTP 200 with order details.
    -   Failure: HTTP 400/404 with error message.

---

## Info System [NOT USED]

### **GET /api/getbanner**

-   **Input**: None
-   **Output**:
    -   Success: HTTP 200 with a list of banners.
    -   Failure: None specified.

### **GET /api/getproduct**

-   **Input**:
    -   Query parameter: `PROD_CD` (optional).
-   **Output**:
    -   Success: HTTP 200 with product information.
    -   Failure: HTTP 500 with error message.

---

## Admin System [NOT USED]

### **POST /admin/banner/upload**

-   **Input**:
    -   Body:
        -   `title` (string, required)
        -   `start_date` (string, optional, defaults to -1)
        -   `end_date` (string, optional, defaults to -1)
        -   `image` (file, required)
-   **Output**:
    -   Success: HTTP 201 with banner data.
    -   Failure: HTTP 400/500 with error message.

### **POST /admin/product/set**

-   **Input**:
    -   Body:
        -   `PROD_CD` (string, required).
        -   `image_loc` (string, optional).
        -   `explain` (string, optional).
-   **Output**:
    -   Success: HTTP 200 with success message.
    -   Failure: HTTP 400/500 with error message.

---

## Test Endpoints [NOT USED]

### **GET /test/\***

-   **Input**: None
-   **Output**: Renders respective test pages:
    -   `/test/login`
    -   `/test/register`
    -   `/test/getUserInfo`
    -   `/test/getBanner`
    -   `/test/uploadBanner`
    -   `/test/createOrder`
    -   `/test/requestPay`
    -   `/test/applyPointToOrder`

---
