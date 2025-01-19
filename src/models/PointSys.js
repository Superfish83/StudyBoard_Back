const AWS = require('aws-sdk');
const makeId = require('../utility/makeId');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Points';

class PointSys {
    /**
     * Create a new point entry.
     * @param {string} user_id - The user owning the point.
     * @param {number} amount - The amount of points.
     * @param {string} expire_date - The expiration date of the points.
     * @returns {Promise<object>} - The result of the creation process.
     */
    static async create(user_id, amount, expire_date) {
        const id = makeId();
        const point = { id, user_id, amount, expire_date };

        const params = {
            TableName: TABLE_NAME,
            Item: point
        };

        try {
            await dynamoDB.put(params).promise();
            return { success: true, point };
        } catch (error) {
            console.error('Error creating point:', error);
            return { success: false, message: 'Failed to create point.' };
        }
    }

    /**
     * Get point by ID.
     * @param {string} id - The ID of the point.
     * @returns {Promise<object|null>} - The point object if found.
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
            console.error('Error fetching point by ID:', error);
            return null;
        }
    }

    /**
     * Get points by user ID and optional expiration filter.
     * @param {string} user_id - The user ID.
     * @param {number|null} expire_in - Optional expiration filter in seconds.
     * @returns {Promise<object[]>} - List of points.
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
            console.error('Error fetching points by user ID:', error);
            return [];
        }
    }

    /**
     * Get total points for a user.
     * @param {string} user_id - The user ID.
     * @returns {Promise<number>} - The total amount of points.
     */
    static async totalPoint(user_id) {
        const points = await this.getByUserId(user_id);
        return points.reduce((sum, point) => sum + point.amount, 0);
    }

    /**
     * Delete a point by ID.
     * @param {string} id - The ID of the point to delete.
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
            console.error('Error deleting point by ID:', error);
            return false;
        }
    }

    /**
     * Delete points for a user based on the amount.
     * @param {string} user_id - The user ID.
     * @param {number} amount - The amount of points to delete.
     * @returns {Promise<boolean>} - Whether the deletion was successful.
     */
    static async deleteByUserId(user_id, amount) {
        console.log(user_id, amount);
        const points = await this.getByUserId(user_id);
        points.sort((a, b) => new Date(a.expire_date) - new Date(b.expire_date));

        let remaining = amount;

        for (const point of points) {
            if (remaining <= 0) break;

            if (point.amount <= remaining) {
                await this.delete(point.id);
                remaining -= point.amount;
            } else {
                await this.deduct(point.id, remaining);
                remaining = 0;
            }
        }

        return remaining === 0;
    }

    /**
     * Deduct points from a specific point entry.
     * @param {string} id - The ID of the point.
     * @param {number} deduction - The amount to deduct.
     * @returns {Promise<boolean>} - Whether the deduction was successful.
     */
    static async deduct(id, deduction) {
        const point = await this.get(id);
        if (!point) return false;

        const newAmount = point.amount - deduction;
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
            console.error('Error deducting points:', error);
            return false;
        }
    }
}

module.exports = PointSys;