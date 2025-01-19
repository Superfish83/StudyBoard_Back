const AWS = require('aws-sdk');
const makeId = require('../utility/makeId');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'OrderATRS';

class OrderSys {
    /**
     * Create a new order.
     * @param {string} user_id - The ID of the user creating the order.
     * @param {string} store_id - The ID of the store where the order is placed.
     * @param {number} price - The total price of the order.
     * @param {string} date - The date of the order.
     * @param {string} content - The content/details of the order.
     * @returns {Promise<object>} - The result of the creation process.
     */
    static async createOrder(user_id, store_id, price, date, content) {
        const order_id = makeId();
        const newOrder = {
            order_id,
            user_id,
            store_id,
            price,
            amt: price,
            discount_point: 0,
            discount_coupon: 0,
            date,
            content,
            process_status: 1
        };

        const params = {
            TableName: TABLE_NAME,
            Item: newOrder
        };

        try {
            await dynamoDB.put(params).promise();
            return { success: true, order_id };
        } catch (error) {
            console.error('Error creating order:', error);
            return { success: false, message: 'Failed to create order.' };
        }
    }

    /**
     * Update an order by order_id.
     * @param {string} order_id - The ID of the order to update.
     * @param {object} updates - The fields to update.
     * @returns {Promise<boolean>} - Whether the update was successful.
     */
    static async updateOrder(order_id, updates) {
        const updateExpressions = [];
        const expressionAttributeValues = {};

        for (const [key, value] of Object.entries(updates)) {
            updateExpressions.push(`${key} = :${key}`);
            expressionAttributeValues[`:${key}`] = value;
        }

        const params = {
            TableName: TABLE_NAME,
            Key: { order_id },
            UpdateExpression: `set ${updateExpressions.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues
        };

        try {
            await dynamoDB.update(params).promise();
            return true;
        } catch (error) {
            console.error('Error updating order:', error);
            return false;
        }
    }

    /**
     * Update the status of an order by order_id.
     * @param {string} order_id - The ID of the order.
     * @param {number} process_status - The new status of the order.
     * @returns {Promise<boolean>} - Whether the update was successful.
     */
    static async updateOrderStatus(order_id, process_status) {
        console.log(order_id);
        return await this.updateOrder(order_id, { process_status });
    }

    /**
     * Apply a point discount to the order.
     * @param {string} order_id - The ID of the order.
     * @param {number} point_amount - The amount of points to discount.
     * @returns {Promise<boolean>} - Whether the discount was successful.
     */
    static async discountPoint(order_id, point_amount) {
        const order = await this.getOrder(order_id);
        if (!order) throw new Error(`Order with ID ${order_id} not found.`);
        if (point_amount > order.amt) throw new Error('Point discount exceeds the remaining amount.');

        const updates = {
            discount_point: order.discount_point + point_amount,
            amt: order.amt - point_amount
        };

        return await this.updateOrder(order_id, updates);
    }

    /**
     * Apply a coupon discount to the order.
     * @param {string} order_id - The ID of the order.
     * @param {number} discount_amount - The coupon discount amount.
     * @returns {Promise<boolean>} - Whether the discount was successful.
     */
    static async discountCoupon(order_id, discount_amount) {
        const order = await this.getOrder(order_id);
        if (!order) throw new Error(`Order with ID ${order_id} not found.`);
        if (discount_amount > order.amt) throw new Error('Coupon discount exceeds the remaining amount.');

        const updates = {
            discount_coupon: order.discount_coupon + discount_amount,
            amt: order.amt - discount_amount
        };

        return await this.updateOrder(order_id, updates);
    }

    /**
     * Get an order by order_id.
     * @param {string} order_id - The ID of the order.
     * @returns {Promise<object|null>} - The order object if found, otherwise null.
     */
    static async getOrder(order_id) {
        const params = {
            TableName: TABLE_NAME,
            Key: { order_id }
        };

        try {
            const result = await dynamoDB.get(params).promise();
            return result.Item || null;
        } catch (error) {
            console.error('Error fetching order by ID:', error);
            return null;
        }
    }

    /**
     * Get all orders for a user by user_id.
     * @param {string} user_id - The ID of the user.
     * @returns {Promise<object[]>} - A list of orders for the user.
     */
    static async orderHistoryUser(user_id) {
        const params = {
            TableName: TABLE_NAME,
            IndexName: 'user_id-index', // Assumes GSI on user_id
            KeyConditionExpression: 'user_id = :uid',
            ExpressionAttributeValues: { ':uid': user_id }
        };

        try {
            const result = await dynamoDB.query(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error('Error fetching orders by user ID:', error);
            return [];
        }
    }

    /**
     * Mark an order as deleted by setting status to 101.
     * @param {string} order_id - The ID of the order to delete.
     * @returns {Promise<boolean>} - Whether the deletion was successful.
     */
    static async deleteOrder(order_id) {
        return await this.updateOrder(order_id, { process_status: 101 });
    }
}

module.exports = OrderSys;