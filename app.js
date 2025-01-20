"use strict";

// Dotenv
require("dotenv").config();

// Modules & Middlewares
const express = require("express");
// const bodyParser = require("body-parser");  replaced with express.json()
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const serveStatic = require("serve-static");

// Personal Middlewares
const getUserIp = require("./src/middleware/getUserIp");
const ensureAuth = require("./src/middleware/ensureAuth");

// app
const home = require("./src/routes");
const app = express();

// app setting
app.set("views", "./src/views");
app.set("view engine", "ejs");

// use middle ware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(`${__dirname}/src/public`));
app.use(cors());
app.use(
    serveStatic(path.join(__dirname, "public"), {
        setHeaders: (res, path) => {
            if (path.endsWith(".css")) {
                res.setHeader("Content-Type", "text/css");
            }
            if (path.endsWith(".js")) {
                res.setHeader("Content-Type", "application/javascript");
            }
        },
    })
);

// use personal middleware
app.use(getUserIp);
app.use(ensureAuth);
app.use("/", home);

module.exports = app;
