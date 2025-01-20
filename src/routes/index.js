"use strict";

const express = require("express");
const { validateToken } = require("../middleware/validateToken");
const router = express.Router();

const ctrl = require("./home.ctrl");

// router.get("/", ctrl.output.root);
router.post("/", (req, res) => {
    console.log(req.body);
    res.status(200).send("success");
});

// oauth    ========================================
router.get("/login/google", ctrl.usersys.request);
router.get("/login/google/callback", ctrl.usersys.callback);
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

// user api ========================================
router.post("/api/register", ctrl.usersys.register);
router.post("/api/login", ctrl.usersys.login);

router.post("/api/userinfo", validateToken, ctrl.usersys.userInfo);

// room api ========================================
router.get("/api/room/search", ctrl.roomsys.search);
router.post("/api/room/create", validateToken, ctrl.roomsys.create);
// crud
router.get("/api/room/:id", ctrl.roomsys.roomInfo);
router.patch("/api/room/:id", validateToken, ctrl.roomsys.roomUpdate);
router.delete("/api/room/:id", validateToken, ctrl.roomsys.roomDelete);

// Test
router.get("/test/login", (req, res) => res.render("test/login"));
router.get("/test/register", (req, res) => res.render("test/register"));
router.get("/test/getUserInfo", (req, res) => res.render("test/getUserInfo"));

module.exports = router;

// unused
// router.get("/test/getBanner", (req, res) => res.render("test/getBanner"));
// router.get("/test/getProduct", (req, res) => res.render("test/getProduct"));
// router.get("/test/uploadBanner", (req, res) => res.render("test/uploadBanner"));
// router.get("/test/createOrder", (req, res) => res.render("test/createOrder"));
// router.get("/test/requestPay", (req, res) => res.render("test/requestPay"));
// router.get("/test/applyPointToOrder", (req, res) => res.render("test/applyPointToOrder"));
// router.get("/test/productSet", (req, res) => res.render("test/productSet"));

// router.get("/test", (req, res) => res.render("test/test"));
// router.get("/order", (req, res) => res.render("test/order"));

// Login
// router.get("/login", ctrl.output.login);
// router.get("/api/getbanner", ctrl.infosys.banner);
// router.get("/api/getproduct", ctrl.infosys.product);
// router.post("/api/order/create", ctrl.ordersys.create);
// router.post("/api/order/get", ctrl.ordersys.get);

// Admin
// router.post("/admin/banner/upload", ctrl.adminsys.banner.upload);
// router.post("/admin/product/set", ctrl.adminsys.product.set);
