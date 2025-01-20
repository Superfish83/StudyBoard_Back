const makeId = require("../utility/makeId");
const db = require("../database/db");
const JwtManage = require("./JwtManage");

// reuse if we were to use AWS
// const AWS = require("aws-sdk");
// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
//     region: process.env.AWS_REGION,
// });

// const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "user";

class UserManage {
    static async get(idOrEmail) {
        const query = {
            sql: `SELECT * FROM \`${TABLE_NAME}\` 
            WHERE id = ? OR email = ?`,
            values: [idOrEmail, idOrEmail],
        };
        try {
            const result = await db.query(query);
            console.log(result);
            return { success: true, ...(result?.[0] || null) };
        } catch (error) {
            console.error("Error fetching user by ID or email:", error);
            return { success: false, message: "Failed to fetch user." };
        }
    }

    static async login(email, pw) {
        const user = await this.get(email);
        if (user.success && user.pw === pw) {
            return { success: true, user: user };
        } else {
            return {
                success: false,
                message: "가입하지 않은 이메일이거나 잘못된 비밀번호입니다.",
            };
        }
    }

    static async register(email, pw, name, ip) {
        const existingUser = await this.get(email);
        if (existingUser.success) {
            return { success: false, message: "이미 가입된 이메일입니다." };
        }
        const id = makeId();
        const created_at = Date.now();
        const query = {
            sql: `INSERT INTO \`${TABLE_NAME}\` 
            (id, email, pw, name, ip, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            values: [id, email, pw, name, ip, created_at, created_at],
        };

        // mysql
        try {
            await db.query(query);
            return { success: true, id: id };
        } catch (error) {
            console.error("Error registering user:", error);
            return { success: false, message: "Failed to register user." };
        }
    }
}

module.exports = UserManage;
