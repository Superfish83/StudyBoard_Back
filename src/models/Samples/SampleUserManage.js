// UserManage.js
// unused.

const fs = require("fs");
const path = require("path");

const userFilePath = path.join(__dirname, "../../filedb/userList.json");
const makeId = require("../utility/makeId");

const msg_doesnot_regist = "가입하지 않은 이메일입니다";
const msg_already_regist = "이미 가입된 이메일입니다.";

class UserManage {
    // Load user data from user.json
    static loadUserData() {
        try {
            const data = fs.readFileSync(userFilePath, "utf8");
            return JSON.parse(data);
        } catch (err) {
            console.error("Error reading user.json:", err);
            return [];
        }
    }

    // Save updated user data to user.json
    static saveUserData(users) {
        try {
            fs.writeFileSync(
                userFilePath,
                JSON.stringify(users, null, 2),
                "utf8"
            );
        } catch (err) {
            console.error("Error writing to user.json:", err);
        }
    }

    /**
     * get: Retrieves a user by ID or email.
     * @param {string} id - The ID or email of the user to retrieve.
     * @returns {Object|null} - The user object if found, otherwise null.
     */
    static get(id) {
        const users = UserManage.loadUserData();
        // Find user by ID or email
        const user = users.find((user) => user.id === id);
        return user || null;
    }

    /**
     * login: Logs in the user using Google OAuth.
     * If the email exists in user.json, the login is approved.
     * @param {string} email - The email of the user trying to log in.
     * @returns {Object} - Contains login result and user information.
     */
    static login(email) {
        const users = UserManage.loadUserData();
        const user = users.find((user) => user.email === email);
        if (user) {
            return { success: true, ...user };
        } else {
            return { success: false, message: msg_doesnot_regist };
        }
    }

    /**
     * register: Registers a new user using Google OAuth.
     * The email must end with "snu.ac.kr" to proceed.
     * Only the email is registered, class is set to 5 by default.
     * @param {string} email - The email of the user trying to register.
     * @returns {Object} - Contains registration result and user information.
     */
    static register(
        email,
        phone = "01012341234",
        name = "KangSample",
        member_level = 1,
        loyalty_point = 0
    ) {
        const users = UserManage.loadUserData();
        if (users.find((user) => user.email === email)) {
            return { success: false, message: msg_already_regist };
        }

        // Register new user
        const id = makeId();
        const newUser = {
            id: id,
            email: email,
            phone: phone,
            name: name,
            member_level: member_level,
            loyalty_point: loyalty_point,
        };
        users.push(newUser);
        UserManage.saveUserData(users);

        return { success: true, ...newUser };
    }

    /**
     * elevate: Elevates a user's class from 5 to 4.
     * Adds the phone and number fields to the user.
     * @param {string} email - The email of the user to elevate.
     * @param {string} phone - The phone number of the user.
     * @param {string} number - The number of the user (e.g., student ID).
     * @returns {boolean} - True if elevation is successful, otherwise false.
     */
    static elevate(email, auth) {
        const users = UserManage.loadUserData();
        const user = users.find((user) => user.email === email);
        if (!user) {
            return false;
        }

        // Elevate user
        user.member_level = auth;
        UserManage.saveUserData(users);
        return true;
    }

    /**
     * updatePoint: update user's point to point
     * @param {string} id - PK. user to update point amount.
     * @param {int} point - point amount that user will have
     * @returns {boolean} - True if elevation is successful, otherwise false.
     */
    static updatePoint(id, point) {
        const users = UserManage.loadUserData();
        const user = users.find((user) => user.id === id);
        if (!user) {
            return false;
        }
        user.loyalty_point = point;
        UserManage.saveUserData(users);
        return true;
    }

    /**
     * create: Tries to login if the user exists, otherwise registers the user.
     * @param {string} email - The email of the user to create or log in.
     * @returns {Object} - Contains result of login or registration.
     */
    static create(email) {
        const users = UserManage.loadUserData();
        const user = users.find((user) => user.email === email);

        if (user) {
            return { success: true, ...user };
        } else {
            return UserManage.register(email);
        }
    }

    /**
     * isExist: check is the user exist
     * @param {string} email - The email of the user want to find
     * @returns {Boolean} - whether user exist
     */
    static isExist(email) {
        const users = UserManage.loadUserData();
        const user = users.find((user) => user.email === email);
        return user ? true : false;
    }
}

module.exports = UserManage;
