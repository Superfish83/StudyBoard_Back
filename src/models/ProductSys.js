const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'ProductATRS';

class ProductSys {
    static _data = null;

    /**
     * Initialize the system by loading all data from the DB into the class.
     */
    static async init() {
        const params = { TableName: TABLE_NAME };
        try {
            const result = await dynamoDB.scan(params).promise();
            if (!result.Items || result.Items.length === 0) {
                console.log('Table is empty, creating sample items.');
                await this._createSampleData();
                this._data = await this.get();
            } else { this._data = result.Items; }
        } catch (error) {
            console.error('Error initializing ProductInfoSys:', error);
            this._data = [];
        }
    }

    /**
     * Create sample data in the table if it is empty.
     */
    static async _createSampleData() {
        const sampleData = [
            { PROD_CD: 'P001', PROD_NM: 'Sample Product 1', SALE_UPRC: 1000, TAX_YN: 'Y', SIDE_MENU_YN: 'N', PROD_IMAGE: 'sample1.jpg', PROD_EXPLAIN: 'This is a sample product 1.' },
            { PROD_CD: 'P002', PROD_NM: 'Sample Product 2', SALE_UPRC: 2000, TAX_YN: 'Y', SIDE_MENU_YN: 'Y', PROD_IMAGE: 'sample2.jpg', PROD_EXPLAIN: 'This is a sample product 2.' },
            { PROD_CD: 'P003', PROD_NM: 'Sample Product 3', SALE_UPRC: 3000, TAX_YN: 'N', SIDE_MENU_YN: 'N', PROD_IMAGE: 'sample3.jpg', PROD_EXPLAIN: 'This is a sample product 3.' },
            { PROD_CD: 'P004', PROD_NM: 'Sample Product 4', SALE_UPRC: 4000, TAX_YN: 'Y', SIDE_MENU_YN: 'N', PROD_IMAGE: 'sample4.jpg', PROD_EXPLAIN: 'This is a sample product 4.' },
            { PROD_CD: 'P005', PROD_NM: 'Sample Product 5', SALE_UPRC: 5000, TAX_YN: 'N', SIDE_MENU_YN: 'Y', PROD_IMAGE: 'sample5.jpg', PROD_EXPLAIN: 'This is a sample product 5.' }
        ];

        try {
            for (const item of sampleData) {
                const params = { TableName: TABLE_NAME, Item: item };
                await dynamoDB.put(params).promise();
            }
            console.log('Sample data created successfully.');
        } catch (error) {
            console.error('Error creating sample data:', error);
        }
    }

    /**
     * Get data based on the param.
     * @param {string|array|null} param - PROD_CD or a list of PROD_CDs, or null to get all data.
     * @returns {object|array} - The requested data.
     */
    static async get(param = null) {
        if (!this._data) await this.init();
        if (!param) return this._data;
        if (typeof param === 'string') { return this._data.find(item => item.PROD_CD === param) || null; }
        if (Array.isArray(param)) { return this._data.filter(item => param.includes(item.PROD_CD)); }
        return null;
    }

    /**
     * Refresh the internal data by reloading from the DB.
     */
    static async refresh() { await this.init(); }

    /**
     * Update the values of a product identified by PROD_CD.
     * @param {string} PROD_CD - The product code.
     * @param {object} diff - The fields to update.
     * @returns {boolean} - Whether the update was successful.
     */
    static async set(PROD_CD, diff) {
        const updateExpressions = [];
        const expressionAttributeValues = {};
        for (const [key, value] of Object.entries(diff)) {
            updateExpressions.push(`${key} = :${key}`);
            expressionAttributeValues[`:${key}`] = value;
        }

        const params = {
            TableName: TABLE_NAME,
            Key: { PROD_CD },
            UpdateExpression: `set ${updateExpressions.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues
        };

        try { await dynamoDB.update(params).promise(); await this.refresh(); return true; }
        catch (error) { console.error('Error updating product info:', error); return false; }
    }

    /**
     * Set the product image.
     * @param {string} PROD_CD - The product code.
     * @param {string} image_loc - The new image location.
     * @returns {boolean} - Whether the update was successful.
     */
    static async setImage(PROD_CD, image_loc) { return await this.set(PROD_CD, { PROD_IMAGE: image_loc }); }

    /**
     * Set the product explanation.
     * @param {string} PROD_CD - The product code.
     * @param {string} explain - The new explanation.
     * @returns {boolean} - Whether the update was successful.
     */
    static async setExplain(PROD_CD, explain) { return await this.set(PROD_CD, { PROD_EXPLAIN: explain }); }
}

module.exports = ProductSys;