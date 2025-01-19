const AWS = require('aws-sdk');
const makeId = require('../utility/makeId');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'StampATRS';

class StampSys {
    /**
     * Create a new stamp entry.
     * @param {string} user_id - The user owning the stamp.
     * @param {number} amount - The number of stamps.
     * @param {string} expire_date - The expiration date of the stamps.
     * @returns {Promise<object>} - The result of the creation process.
     */
    static async create(user_id, amount, expire_date) {
        const id = makeId();
        const stamp = { id, user_id, amount, expire_date };

        const params = {
            TableName: TABLE_NAME,
            Item: stamp
        };

        try {
            await dynamoDB.put(params).promise();
            return { success: true, stamp };
        } catch (error) {
            console.error('Error creating stamp:', error);
            return { success: false, message: 'Failed to create stamp.' };
        }
    }

    /**
     * Get a stamp by ID.
     * @param {string} id - The ID of the stamp.
     * @returns {Promise<object|null>} - The stamp object if found.
     */
    static async get(id) {
        const params = {
            TableName: TABLE_NAME,
            Key: { id }
        };

        try {
            const result = await dynamoDB.get(params).promise();
            return result.Item || null;
        } catch (error) {
            console.error('Error fetching stamp by ID:', error);
            return null;
        }
    }

    /**
     * Get stamps by user ID and optional expiration filter.
     * @param {string} user_id - The user ID.
     * @param {number|null} expire_in - Optional expiration filter in seconds.
     * @returns {Promise<object[]>} - List of stamps.
     */
    static async getByUserId(user_id, expire_in = null) {
        const now = new Date();
        const filterExp = expire_in ? 'user_id = :uid AND expire_date <= :exp' : 'user_id = :uid';
        const params = {
            TableName: TABLE_NAME,
            FilterExpression: filterExp,
            ExpressionAttributeValues: {
                ':uid': user_id,
                ...(expire_in && { ':exp': new Date(now.getTime() + expire_in * 1000).toISOString() })
            }
        };

        try {
            const result = await dynamoDB.scan(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error('Error fetching stamps by user ID:', error);
            return [];
        }
    }

    /**
     * Get total stamps for a user.
     * @param {string} user_id - The user ID.
     * @returns {Promise<number>} - The total number of stamps.
     */
    static async totalStamp(user_id) {
        const stamps = await this.getByUserId(user_id);
        return stamps.reduce((sum, stamp) => sum + stamp.amount, 0);
    }

    /**
     * Delete a stamp by ID.
     * @param {string} id - The ID of the stamp to delete.
     * @returns {Promise<boolean>} - Whether the deletion was successful.
     */
    static async delete(id) {
        const params = {
            TableName: TABLE_NAME,
            Key: { id }
        };

        try {
            await dynamoDB.delete(params).promise();
            return true;
        } catch (error) {
            console.error('Error deleting stamp by ID:', error);
            return false;
        }
    }

    /**
     * Delete stamps for a user based on the amount.
     * @param {string} user_id - The user ID.
     * @param {number} amount - The number of stamps to delete.
     * @returns {Promise<boolean>} - Whether the deletion was successful.
     */
    static async deleteByUserId(user_id, amount) {
        const stamps = await this.getByUserId(user_id);
        stamps.sort((a, b) => new Date(a.expire_date) - new Date(b.expire_date));

        let remaining = amount;

        for (const stamp of stamps) {
            if (remaining <= 0) break;

            if (stamp.amount <= remaining) {
                await this.delete(stamp.id);
                remaining -= stamp.amount;
            } else {
                await this.deduct(stamp.id, remaining);
                remaining = 0;
            }
        }

        return remaining === 0;
    }

    /**
     * Deduct stamps from a specific stamp entry.
     * @param {string} id - The ID of the stamp.
     * @param {number} deduction - The number of stamps to deduct.
     * @returns {Promise<boolean>} - Whether the deduction was successful.
     */
    static async deduct(id, deduction) {
        const stamp = await this.get(id);
        if (!stamp) return false;

        const newAmount = stamp.amount - deduction;
        if (newAmount < 0) return false;

        const params = {
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: 'set amount = :amt',
            ExpressionAttributeValues: { ':amt': newAmount }
        };

        try {
            await dynamoDB.update(params).promise();
            return true;
        } catch (error) {
            console.error('Error deducting stamps:', error);
            return false;
        }
    }
}

module.exports = StampSys;