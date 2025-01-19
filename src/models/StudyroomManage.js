const AWS = require("aws-sdk");
const makeId = require("../utility/makeId");

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = ""; // TODO: Create a new table for studyroom users

class StudyroomManage {
    /**
     * Get list of studyroom.
     * @param {*} idOrName
     * @returns AWS.DynamoDB.DocumentClient.ItemList || null
     */
    static async get(idOrName) {
        const params = {
            TableName: TABLE_NAME,
            FilterExpression: "id = :id OR name = :name",
            ExpressionAttributeValues: {
                ":id": idOrName,
                ":name": idOrName,
            },
        };
        try {
            const result = await dynamoDB.scan(params).promise();
            return result.Items || null;
        } catch (error) {
            console.error("Error fetching user by ID or email:", error);
            return null;
        }
    }

    // TODO : 스터디룸 [정보]에 무엇을 추가할지?
    static async create(name, description = "") {
        // 스터디룸 이름 중복 허용할지?
        // const existingStudyroom = await this.get(name);
        // if (existingStudyroom) {
        //     return { success: false, message: "이미 존재하는 스터디룸입니다." };
        // }
        const id = makeId();
        const newStudyroom = {
            id,
            name,
            description,
        };
        const params = { TableName: TABLE_NAME, Item: newStudyroom };
        // AWS
        try {
            await dynamoDB.put(params).promise();
            return { success: true, ...newStudyroom };
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

    // TODO: 스터디룸 이름 중복 허용할지?
    static async isExist(name) {
        const user = await this.get(name);
        return !!user;
    }
}

module.exports = StudyroomManage;
