const AWS = require('aws-sdk');
const makeId = require('../utility/makeId');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'CouponATRS';

class CouponSys {
    /**
     * Create a new coupon.
     * @param {string} user_id - The ID of the user owning the coupon.
     * @param {number} type - The type of the coupon (1: Fixed, 2: Percentage).
     * @param {number} value - The discount value.
     * @param {string} expire_date - The expiration date of the coupon.
     * @returns {Promise<object>} - The result of the creation process.
     */
    static async create(user_id, type, value, expire_date) {
        const id = makeId();
        const coupon = { id, user_id, code: uuidv4().slice(0, 8), type, value, expire_date };

        const params = {
            TableName: TABLE_NAME,
            Item: coupon
        };

        try {
            await dynamoDB.put(params).promise();
            return { success: true, coupon };
        } catch (error) {
            console.error('Error creating coupon:', error);
            return { success: false, message: 'Failed to create coupon.' };
        }
    }

    /**
     * Get a coupon by ID.
     * @param {string} coupon_id - The ID of the coupon.
     * @returns {Promise<object|null>} - The coupon object if found.
     */
    static async get(coupon_id) {
        const params = {
            TableName: TABLE_NAME,
            Key: { id: coupon_id }
        };

        try {
            const result = await dynamoDB.get(params).promise();
            return result.Item || null;
        } catch (error) {
            console.error('Error fetching coupon by ID:', error);
            return null;
        }
    }

    /**
     * Get coupons by user ID using GSI.
     * @param {string} user_id - The user ID.
     * @returns {Promise<object[]>} - List of coupons.
     */
    static async getByUser(user_id) {
        const params = {
            TableName: TABLE_NAME,
            IndexName: 'user_id-index', // Name of the GSI
            KeyConditionExpression: 'user_id = :uid',
            ExpressionAttributeValues: { ':uid': user_id }
        };

        try {
            const result = await dynamoDB.query(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error('Error fetching coupons by user ID using GSI:', error);
            return [];
        }
    }

    /**
     * Delete a coupon by ID.
     * @param {string} coupon_id - The ID of the coupon to delete.
     * @returns {Promise<boolean>} - Whether the deletion was successful.
     */
    static async delete(coupon_id) {
        const params = {
            TableName: TABLE_NAME,
            Key: { id: coupon_id }
        };

        try {
            await dynamoDB.delete(params).promise();
            return true;
        } catch (error) {
            console.error('Error deleting coupon by ID:', error);
            return false;
        }
    }

    /**
     * Delete coupons by user ID.
     * @param {string} user_id - The user ID.
     * @returns {Promise<boolean>} - Whether the deletion was successful.
     */
    static async deleteByUser(user_id) {
        try {
            const coupons = await this.getByUser(user_id);
            for (const coupon of coupons) {
                await this.delete(coupon.id);
            }
            return true;
        } catch (error) {
            console.error('Error deleting coupons by user ID:', error);
            return false;
        }
    }

    /**
     * Update a coupon.
     * @param {string} coupon_id - The ID of the coupon to update.
     * @param {object} updates - The fields to update.
     * @returns {Promise<boolean>} - Whether the update was successful.
     */
    static async update(coupon_id, updates) {
        const updateExpressions = [];
        const expressionAttributeValues = {};

        for (const [key, value] of Object.entries(updates)) {
            updateExpressions.push(`${key} = :${key}`);
            expressionAttributeValues[`:${key}`] = value;
        }

        const params = {
            TableName: TABLE_NAME,
            Key: { id: coupon_id },
            UpdateExpression: `set ${updateExpressions.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues
        };

        try {
            await dynamoDB.update(params).promise();
            return true;
        } catch (error) {
            console.error('Error updating coupon:', error);
            return false;
        }
    }
}

module.exports = CouponSys;