const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../../filedb/order.json');
const makeId = require('../utility/makeId');

class SampleOrderSys {
    /**
     * Reads the JSON file and returns its contents.
     * @returns {Array} - List of orders.
     */
    static _readFile() {
        if (!fs.existsSync(FILE_PATH)) {
            fs.writeFileSync(FILE_PATH, JSON.stringify([]), 'utf8');
        }
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(data);
    }

    /**
     * Writes the given data to the JSON file.
     * @param {Array} data - List of orders to save.
     */
    static _writeFile(data) {
        fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    }

    /**
     * createOrder: Creates a new order.
     * @param {string} user_id - The ID of the user creating the order.
     * @param {string} store_id - The ID of the store where the order is placed.
     * @param {number} price - The total price of the order.
     * @param {string} date - The date of the order.
     * @param {string} content - The content/details of the order.
     * @returns {string} - The ID of the created order.
     */
    static createOrder(user_id, store_id, price, date, content) {
        const orders = this._readFile();
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
            status: 1 // Default status
        };
        orders.push(newOrder);
        this._writeFile(orders);
        return order_id;
    }

    /**
     * updateOrder: Updates an order by order_id.
     * @param {string} order_id - The ID of the order to update.
     * @param {Object} updates - The fields to update.
     */
    static updateOrder(order_id, updates) {
        const orders = this._readFile();
        const order = orders.find(o => o.order_id === order_id);
        if (!order) throw new Error(`Order with ID ${order_id} not found.`);

        Object.assign(order, updates);
        this._writeFile(orders);
    }

    /**
     * updateOrderStatus: Updates the status of an order by order_id.
     * @param {string} order_id - The ID of the order.
     * @param {number} status - The new status of the order.
     */
    static updateOrderStatus(order_id, status) {
        this.updateOrder(order_id, { status });
    }

    /**
     * discountPoint: Applies a point discount to the order.
     * @param {string} order_id - The ID of the order.
     * @param {number} point_amount - The amount of points to discount.
     */
    static discountPoint(order_id, point_amount) {
        const orders = this._readFile();
        const order = orders.find(o => o.order_id === order_id);
        if (!order) throw new Error(`Order with ID ${order_id} not found.`);
        if (point_amount > order.amt) { throw new Error('Point discount exceeds the remaining amount.'); }
        order.discount_point += point_amount;
        order.amt -= point_amount;
        this._writeFile(orders);
    }

    /**
     * discountCoupon: Applies a coupon discount to the order.
     * @param {string} order_id - The ID of the order.
     * @param {number} discount_amount - The coupon discount amount.
     */
    static discountCoupon(order_id, discount_amount) {
        const orders = this._readFile();
        const order = orders.find(o => o.order_id === order_id);
        if (!order) throw new Error(`Order with ID ${order_id} not found.`);
        if (discount_amount > order.amt) { throw new Error('Coupon discount exceeds the remaining amount.'); }
        order.discount_coupon += discount_amount;
        order.amt -= discount_amount;
        this._writeFile(orders);
    }

    /**
     * getOrder: Retrieves an order by order_id.
     * @param {string} order_id - The ID of the order.
     * @returns {object|null} - The order object if found, otherwise null.
     */
    static getOrder(order_id) {
        const orders = this._readFile();
        return orders.find(o => o.order_id === order_id) || null;
    }

    /**
     * orderHistoryUser: Retrieves all orders for a given user.
     * @param {string} user_id - The ID of the user.
     * @returns {Array} - A list of orders for the user.
     */
    static orderHistoryUser(user_id) {
        const orders = this._readFile();
        return orders.filter(o => o.user_id === user_id);
    }

    /**
     * deleteOrder: Marks an order as deleted by setting status to 101.
     * @param {string} order_id - The ID of the order to delete.
     */
    static deleteOrder(order_id) {
        this.updateOrder(order_id, { status: 101 });
    }
}

module.exports = SampleOrderSys;