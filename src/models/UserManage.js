const AWS = require("aws-sdk");
const makeId = require("../utility/makeId");

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = ""; // TODO: Create a new table

class UserManage {
    static async get(idOrEmail) {
        const params = {
            TableName: TABLE_NAME,
            FilterExpression: "id = :id OR email = :email",
            ExpressionAttributeValues: {
                ":id": idOrEmail,
                ":email": idOrEmail,
            },
        };
        try {
            const result = await dynamoDB.scan(params).promise();
            return result.Items?.[0] || null;
        } catch (error) {
            console.error("Error fetching user by ID or email:", error);
            return null;
        }
    }

    static async login(email) {
        const user = await this.get(email);
        if (user) {
            return { success: true, ...user };
        } else {
            return { success: false, message: "가입하지 않은 이메일입니다" };
        }
    }

    static async register(
        email,
        phone = "01012341234",
        name = "KangSample",
        member_level = 1,
        loyalty_point = 0,
        stamp = 0
    ) {
        const existingUser = await this.get(email);
        if (existingUser) {
            return { success: false, message: "이미 가입된 이메일입니다." };
        }
        // Remove non-numeric characters
        phone = phone.replace(/\D/g, "");
        const id = makeId();
        const newUser = {
            id,
            email,
            phone,
            name,
            member_level,
            loyalty_point,
            stamp,
        };
        const params = { TableName: TABLE_NAME, Item: newUser };
        // AWS
        try {
            await dynamoDB.put(params).promise();
            return { success: true, ...newUser };
        } catch (error) {
            console.error("Error registering user:", error);
            return { success: false, message: "Failed to register user." };
        }
    }

    static async elevate(email, auth) {
        const user = await this.get(email);
        if (!user) {
            return false;
        }

        const params = {
            TableName: TABLE_NAME,
            Key: { id: user.id },
            UpdateExpression: "set member_level = :auth",
            ExpressionAttributeValues: { ":auth": auth },
        };

        try {
            await dynamoDB.update(params).promise();
            return true;
        } catch (error) {
            console.error("Error elevating user:", error);
            return false;
        }
    }

    static async updatePoint(id, point) {
        const params = {
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: "set loyalty_point = :point",
            ExpressionAttributeValues: { ":point": point },
        };

        try {
            await dynamoDB.update(params).promise();
            return true;
        } catch (error) {
            console.error("Error updating user points:", error);
            return false;
        }
    }

    static async isExist(email) {
        const user = await this.get(email);
        return !!user;
    }
}

module.exports = UserManage;
