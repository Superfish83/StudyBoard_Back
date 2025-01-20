"use strict";

// Logger
const LogSys = require("../models/LogSys"); // not used now

// User Auth System
const OAuth = require("../models/OAuthManage"); // usersys.*
const UserManage = require("../models/UserManage"); // usersys.callback usersys.userInfo
const JwtManage = require("../models/JwtManage"); // usersys.callback usersys.userInfo
const StudyroomManage = require("../models/StudyroomManage");
const RoleManage = require("../models/RoleManage");

// const fs = require("fs");
// const path = require("path");
// const axios = require("axios");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // 자체 서명된 인증서를 신뢰

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
                afterLogin
                    ? res.redirect(req.cookies.afterLogin)
                    : res.redirect("/");
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
        let { email, pw, name } = req.body;
        if (!email) {
            const token = req.cookies?.token;
            if (token) {
                const tokenInfo = JwtManage.get(token);
                if (tokenInfo) {
                    email = tokenInfo.email;
                }
            }
        }
        if (!email || !pw || !name) {
            return res.status(400).json({
                success: false,
                message: "Email, password, and name are required.",
            });
        }
        const result = await UserManage.register(email, pw, name, req.userIp);
        result.success
            ? res.status(201).json({ success: true, user: result })
            : res.status(400).json({ success: false, message: result.message });
    },

    // TODO: password encryption
    login: async (req, res) => {
        console.log("ctrl::usersys.login()");
        const { email, pw } = req.body;
        if (!email || !pw) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }
        const user = await UserManage.login(email, pw);
        if (user.success) {
            // create token
            res.cookie("token", JwtManage.createUser(user.user), {
                httpOnly: false,
                secure: true,
            });
            res.status(200).json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: user.message });
        }
    },

    userInfo: async (req, res) => {
        console.log("ctrl::usersys.userInfo()");
        const token = req.tokenInfo;

        // get user (UserManage)
        const user = await UserManage.get(tokenInfo.userId);
        if (!user.success) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        // Return
        res.status(200).json({ success: true, user });
    },
};

const roomsys = {
    create: async (req, res) => {
        console.log("ctrl::roomsys.create()");
        const { name, description } = req.body;
        if (!name) {
            return res
                .status(400)
                .json({ success: false, message: "Name is required." });
        }

        const room = await StudyroomManage.create(name, description);

        if (room.success) {
            const role = await RoleManage.assgin(
                req.tokenInfo.id,
                room.id,
                RoleManage.role.OWNER
            );

            if (role.success) {
                res.status(201).json({ success: true, room: room });
            } else {
                res.status(400).json({ success: false, message: role.message });
            }
        } else {
            res.status(400).json({ success: false, message: room.message });
        }
    },

    search: async (req, res) => {
        console.log("ctrl::roomsys.search()");
        const { keyword } = req.query;
        if (!keyword) {
            return res
                .status(400)
                .json({ success: false, message: "keyword is required" });
        }

        const rooms = await StudyroomManage.get(keyword);

        if (rooms.success) {
            res.status(200).json({ success: true, rooms: rooms });
        } else {
            res.status(400).json({ success: false, message: rooms.message });
        }
    },

    roomInfo: async (req, res) => {
        console.log("ctrl::roomsys.roomInfo()");
        const { id } = req.params;
        if (!id) {
            return res
                .status(400)
                .json({ success: false, message: "Room ID is required" });
        }
        const room = await StudyroomManage.get(id);
        if (room.success) {
            res.status(200).json({ success: true, room: room });
        } else {
            res.status(400).json({ success: false, message: room.message });
        }
    },

    roomUpdate: async (req, res) => {
        console.log("ctrl::roomsys.roomUpdate()");

        const room_id = req.params.id;

        // check user role - admin or owner
        const relation = await RoleManage.get(req.tokenInfo.id, room_id);
        if (
            !relation.success ||
            (relation.role !== RoleManage.role.OWNER &&
                relation.role !== RoleManage.role.ADMIN)
        ) {
            console.log("Access denied: Not authorized", relation);
            return res.status(403).json({
                success: false,
                message: "Access denied: Not authorized",
            });
        }

        let { name, description } = req.body;
        if (!name && !description) {
            return res.status(400).json({
                success: false,
                message: "At least one field is required",
            });
        }

        // get room
        const temp_room = await StudyroomManage.get(room_id);
        name = name || temp_room.name;
        description = description || temp_room.description;

        const room = await StudyroomManage.update(room_id, name, description);
        if (room.success) {
            res.status(200).json({ success: true, room: room });
        } else {
            res.status(400).json({ success: false, message: room.message });
        }
    },

    roomDelete: async (req, res) => {
        console.log("ctrl::roomsys.roomDelete()");

        // check user jwt
        const room_id = req.params.id;

        // check user role - owner
        const role = await RoleManage.get(req.tokenInfo.id, room_id);
        if (!role.success || role.role !== RoleManage.role.OWNER) {
            return res.status(403).json({
                success: false,
                message: "Access denied: Not authorized",
            });
        }

        // delete room
        const room = await StudyroomManage.delete(room_id);

        // delete role as well
        const role_del = await RoleManage.deleteRoom(room_id);

        if (room.success) {
            res.status(200).json({ success: true, room: room });
        } else {
            res.status(400).json({ success: false, message: room.message });
        }
    },
};

module.exports = {
    usersys,
    roomsys,
};
