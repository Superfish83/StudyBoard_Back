"use strict";

// Logger
const LogSys = require("../models/LogSys"); //

// User Auth System
const OAuth = require("../models/OAuthManage"); // usersys.*
const UserManage = require("../models/UserManage"); // usersys.callback usersys.userInfo
const JwtManage = require("../models/JwtManage"); // usersys.callback usersys.userInfo

// Order System
// const OrderSys = require('../models/OrderSys');         // ordersys.*
// Info System
// const BannerSys = require("../models/BannerSys");       // adminsys.banner.upload, infosys.banner
// Point System
// const PointSys = require("../models/SamplePointSys");   // Point system
// Stamp System
// const StampSys = require("../models/StampSys");

// Product Info System
// const ProductSys = require("../models/ProductSys");     // Product System

// const multer = require("multer");
// const storage = multer.memoryStorage();
// const uploadBanner = multer({ storage }).single("image");

const fs = require("fs");
const path = require("path");
const axios = require("axios");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // 자체 서명된 인증서를 신뢰

// const output = {
//   root: (req, res) => {
//     res.render("index");
//   },
// };

const usersys = {
  request: (req, res) => {
    console.log("ctrl::usersys.request()");
    const authUrl = OAuth.getAuthUrl();
    res.redirect(authUrl);
  },

  callback: async (req, res) => {
    const code = req.query.code;
    if (!code) return res.redirect("/");
    try {
      const userInfo = await OAuth.getUserInfo(code);
      const user = await UserManage.login(userInfo.email);
      if (user.success) {
        res.cookie("token", JwtManage.createUser(user), {
          httpOnly: false,
          secure: true,
        });
        const afterLogin = req.cookies?.afterLogin;
        afterLogin ? res.redirect(req.cookies.afterLogin) : res.redirect("/");
      } else {
        res.cookie(
          "token",
          JwtManage.create({ email: userInfo.email }, "30m"),
          { httpOnly: false, secure: true }
        );
        res.redirect(process.env.REGISTER_PAGE || "/register");
      }
    } catch (error) {
      console.error("Error handling callback:", error);
      res.redirect("/");
    }
  },

  register: async (req, res) => {
    let { email, phone, name } = req.body;
    if (!email) {
      const token = req.cookies?.token;
      if (token) {
        const tokenInfo = JwtManage.get(token);
        if (tokenInfo) {
          email = tokenInfo.email;
        }
      }
    }
    if (!email || !phone || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, phone, and name are required.",
      });
    }
    const result = await UserManage.register(email, phone, name);
    result.success
      ? res.status(201).json({ success: true, user: result })
      : res.status(400).json({ success: false, message: result.message });
  },

  userInfo: async (req, res) => {
    console.log("ctrl::usersys.userInfo()");
    const token = req.cookies?.token;
    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
      return;
    }
    const tokenInfo = JwtManage.get(token);
    if (!tokenInfo) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized: Invalid token" });
      return;
    }
    // get user (UserManage)
    const user = await UserManage.login(tokenInfo.email);
    if (!user.success) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    // Fetch user points
    const totalPoints = await PointSys.totalPoint(user.id);
    await UserManage.updatePoint(user.id, totalPoints);
    user.points = totalPoints;
    // Fetch user stamps
    const totalStamps = await StampSys.totalStamp(user.id);
    user.stamps = totalStamps;
    // Return
    res.status(200).json({ success: true, user });
  },
};

// const ordersys = {
//   usePoint: async (req, res) => {
//     console.log("ctrl::usersys.usePoint()");
//     const user = req.user;
//     if (!user || !user.id) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not logged in" });
//     }
//     const { order_id, point_amount } = req.body;
//     if (!order_id || !point_amount) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing required fields" });
//     }
//     try {
//       // Get User & Order Information
//       const userInfo = await UserManage.login(user.id);
//       if (!userInfo.success) {
//         return res
//           .status(404)
//           .json({ success: false, message: "User not found" });
//       }
//       const order = await OrderSys.getOrder(order_id);
//       if (!order) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Order not found" });
//       }
//       if (order.user_id !== userInfo.id) {
//         return res
//           .status(403)
//           .json({
//             success: false,
//             message: "Access denied: Order does not belong to the user",
//           });
//       }
//       // Use Point
//       const userPoints = userInfo.loyalty_point;
//       if (point_amount > userPoints) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Insufficient points" });
//       }
//       await PointSys.deleteByUserId(userInfo.id, point_amount);
//       await OrderSys.discountPoint(order_id, point_amount);
//       // Update User Points
//       const updatedPoints = await PointSys.totalPoint(userInfo.id);
//       await UserManage.updatePoint(userInfo.id, updatedPoints);
//       res
//         .status(200)
//         .json({
//           success: true,
//           message: "Points applied successfully",
//           remainingPoints: updatedPoints,
//         });
//     } catch (error) {
//       console.error("Error in usePoint:", error);
//       res
//         .status(500)
//         .json({ success: false, message: "Internal server error" });
//     }
//   },

//   create: async (req, res) => {
//     console.log("ctrl::ordersys.create()");
//     const user = req.user;
//     if (!user || !user.id) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not logged in" });
//     }
//     // Extract order details from the request body
//     const { store_id, price, content, point_amount = 0 } = req.body;
//     if (!store_id || !price || !content) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing required fields" });
//     }
//     try {
//       // Create a new order
//       const date = new Date().toISOString();
//       const orderId = await OrderSys.createOrder(
//         user.id,
//         store_id,
//         price,
//         date,
//         content
//       );
//       // If point_amount is provided, apply it to the order
//       if (point_amount > 0) {
//         const userPoints = await PointSys.totalPoint(user.id);
//         if (point_amount > userPoints) {
//           return res
//             .status(400)
//             .json({ success: false, message: "Insufficient points" });
//         }
//         await PointSys.deleteByUserId(user.id, point_amount);
//         await OrderSys.discount(orderId, point_amount);
//         const updatedPoints = await PointSys.totalPoint(user.id);
//         await UserManage.updatePoint(user.id, updatedPoints);
//       }
//       res.status(201).json({ ...orderId });
//     } catch (error) {
//       console.error("Error creating order:", error);
//       res
//         .status(500)
//         .json({ success: false, message: "Failed to create order" });
//     }
//   },

//   get: async (req, res) => {
//     console.log("ctrl::ordersys.get()");
//     const { order_id } = req.body;
//     if (!order_id) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Order ID is required" });
//     }
//     try {
//       // Get Order
//       const order = await OrderSys.getOrder(order_id);
//       if (!order) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Order not found" });
//       }
//       res.status(200).json({ success: true, order });
//     } catch (error) {
//       console.error("Error fetching order:", error);
//       res
//         .status(500)
//         .json({ success: false, message: "Failed to fetch order" });
//     }
//   },

//   reqPayment_post: async (req, res) => {
//     console.log("ctrl::ordersys.reqPayment_post()");
//     const user = req.user; // Assuming `req.user` contains the logged-in user info
//     if (!user || !user.id) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not logged in" });
//     }
//     const { order_id, redirect_to } = req.body;
//     if (!order_id || !redirect_to) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing required fields" });
//     }
//     try {
//       // Retrieve order details
//       const order = await OrderSys.getOrder(order_id);
//       if (!order) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Order not found" });
//       }
//       if (order.user_id !== user.id) {
//         return res
//           .status(403)
//           .json({
//             success: false,
//             message: "Access denied: Order does not belong to the user",
//           });
//       }
//       if (order.process_status !== 1) {
//         return res
//           .status(403)
//           .json({
//             success: false,
//             message: "Access denied: Order was paid already",
//           });
//       }
//       // Retrieve user details
//       const userInfo = await UserManage.get(user.id);
//       if (!userInfo) {
//         return res
//           .status(404)
//           .json({ success: false, message: "User information not found" });
//       }
//       // Prepare data for payment request
//       const paymentData = {
//         goodsNm: `order${order_id.slice(0, 3)}`,
//         ordNo: order_id,
//         goodsAmt: order.amt,
//         ordNm: userInfo.name,
//         ordTel: userInfo.phone,
//         ordEmail: userInfo.email,
//         redirect_to: redirect_to,
//         store_no: order.store_id,
//         content: order.content,
//       };
//       console.log(paymentData);
//       // Send POST request to the payment service
//       const response = await axios.post(
//         `${process.env.PAYMENT_URL}${process.env.PAYMENT_REQPAY}`,
//         paymentData
//       );
//       // Extract token from the response
//       const { token } = response.data;
//       if (!token) {
//         return res
//           .status(500)
//           .json({ success: false, message: "Token not found in response" });
//       }
//       return res.status(200).json({ success: true, token });
//     } catch (error) {
//       console.error("Error in reqPayment:", error);
//       res
//         .status(500)
//         .json({ success: false, message: "Failed to process payment request" });
//     }
//   },

//   reqPayment_get: (req, res) => {
//     console.log("ctrl::ordersys.reqPayment_get()");
//     const { token } = req.query;
//     if (!token) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing token parameter" });
//     }
//     try {
//       // Construct the redirect URL
//       const redirectUrl = `${process.env.PAYMENT_URL}${process.env.PAYMENT_REQPAY}?token=${token}`;
//       // Redirect to the constructed URL
//       return res.redirect(redirectUrl);
//     } catch (error) {
//       console.error("Error in reqPayment_get:", error);
//       res
//         .status(500)
//         .json({ success: false, message: "Failed to process the request" });
//     }
//   },

//   reportPay: async (req, res) => {
//     console.log("[ALPHA] ordersys.reportPay()");
//     const { resultCd, ordNo } = req.body;
//     if (!resultCd || !ordNo) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Missing required fields: resultCd or ordNo.",
//         });
//     }
//     try {
//       if (resultCd === "3001") {
//         // Fetch the order details using ordNo
//         const order = await OrderSys.getOrder(ordNo);
//         if (!order) {
//           return res
//             .status(404)
//             .json({ success: false, message: "Order not found." });
//         }
//         // Update the order status to PAY (2)
//         await OrderSys.updateOrderStatus(ordNo, 2);
//         // Issue points to the user
//         const issue = Math.floor(order.price * 0.05);
//         await PointSys.create(
//           order.user_id,
//           issue,
//           new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
//         );
//         // Issue a stamp to the user
//         await StampSys.create(
//           order.user_id,
//           1,
//           new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
//         );
//         // Check if the user has 10 or more stamps
//         const totalStamps = await StampSys.totalStamp(order.user_id);
//         if (totalStamps >= 10) {
//           await StampSys.deleteByUserId(order.user_id, 10);
//           console.log("issue coupon");
//         }
//         return res
//           .status(200)
//           .json({
//             success: true,
//             message: "Order status updated to PAY, points and stamps issued.",
//           });
//       } else {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: "Invalid resultCd. Payment not successful.",
//           });
//       }
//     } catch (error) {
//       console.error("Error in reportPay:", error);
//       return res
//         .status(500)
//         .json({ success: false, message: "Internal server error." });
//     }
//   },

//   reportAcp: (req, res) => {
//     console.log("[ALPHA] ordersys.reportAcp()");
//     console.log(req.body);
//     res.status(200).send("success");
//   },
// };

// const adminsys = {
//   banner: {
//     upload: (req, res) => {
//       console.log("ctrl::adminsys.banner.upload()");

//       uploadBanner(req, res, (err) => {
//         if (err)
//           return res
//             .status(500)
//             .json({ success: false, message: "Failed to process the file." });
//         const { title, start_date = -1, end_date = -1 } = req.body;
//         if (!title || !req.file)
//           return res
//             .status(400)
//             .json({ success: false, message: "Title and image are required." });

//         const mimeToExt = {
//           "image/jpeg": ".jpg",
//           "image/png": ".png",
//           "image/gif": ".gif",
//           "image/webp": ".webp",
//         };
//         const ext = mimeToExt[req.file.mimetype];
//         if (!ext)
//           return res
//             .status(400)
//             .json({ success: false, message: "Invalid image format." });

//         try {
//           const banner = BannerSys.create(title, start_date, end_date, ext);
//           const imagePath = path.join(__dirname, "../public", banner.image_loc);

//           fs.writeFileSync(imagePath, req.file.buffer);
//           res.status(201).json({ success: true, banner });
//         } catch (error) {
//           console.error("Error saving banner:", error);
//           res
//             .status(500)
//             .json({ success: false, message: "Failed to upload banner." });
//         }
//       });
//     },
//   }, // banner

//   product: {
//     set: async (req, res) => {
//       console.log("ctrl::adminsys.product.set()");
//       const { PROD_CD, image_loc, explain } = req.body;
//       if (!PROD_CD)
//         return res
//           .status(400)
//           .json({ success: false, message: "PROD_CD is required." });

//       try {
//         if (image_loc) await ProductSys.setImage(PROD_CD, image_loc);
//         if (explain) await ProductSys.setExplain(PROD_CD, explain);
//         res
//           .status(200)
//           .json({ success: true, message: "Product updated successfully." });
//       } catch (error) {
//         console.error("Error updating product:", error);
//         res
//           .status(500)
//           .json({ success: false, message: "Failed to update product." });
//       }
//     },
//   }, // product
// };

// const infosys = {
//   banner: (req, res) => {
//     console.log("ctrl::infosys.banner.get()");
//     const banners = BannerSys.read();
//     res.status(200).json({ success: true, banners });
//   },

//   product: async (req, res) => {
//     console.log("ctrl::infosys.product.get()");
//     const { PROD_CD } = req.query;
//     try {
//       const data = PROD_CD
//         ? await ProductSys.get(PROD_CD)
//         : await ProductSys.get();
//       res.status(200).json({ success: true, data });
//     } catch (error) {
//       console.error("Error fetching product info:", error);
//       res
//         .status(500)
//         .json({ success: false, message: "Failed to fetch product info." });
//     }
//   },
// };

module.exports = {
  //   output,
  usersys,
  //   ordersys,
  //   adminsys,
  //   infosys,
};
