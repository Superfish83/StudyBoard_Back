const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const FILE_PATH = path.join(__dirname, "../../filedb/point.json");

class SamplePointSys {
    /**
     * Read the points file.
     * @returns {Array} - List of points.
     */
    static _readFile() {
        if (!fs.existsSync(FILE_PATH)) {
            fs.writeFileSync(FILE_PATH, JSON.stringify([]), "utf8");
        }
        const data = fs.readFileSync(FILE_PATH, "utf8");
        return JSON.parse(data);
    }

    /**
     * Write data to the points file.
     * @param {Array} data - List of points.
     */
    static _writeFile(data) {
        fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf8");
    }

    /**
     * Create a new point entry.
     * @param {string} user_id - The user owning the point.
     * @param {number} amount - The amount of points.
     * @param {string} expire_date - The expiration date of the points.
     * @returns {object} - The result of the creation process.
     */
    static create(user_id, amount, expire_date) {
        const id = uuidv4();
        const point = { id, user_id, amount, expire_date };

        try {
            const points = this._readFile();
            points.push(point);
            this._writeFile(points);
            return { success: true, point };
        } catch (error) {
            console.error("Error creating point:", error);
            return { success: false, message: "Failed to create point." };
        }
    }

    /**
     * Get point by ID.
     * @param {string} id - The ID of the point.
     * @returns {object|null} - The point object if found.
     */
    static get(id) {
        const points = this._readFile();
        return points.find((point) => point.id === id) || null;
    }

    /**
     * Get points by user ID and optional expiration filter.
     * @param {string} user_id - The user ID.
     * @param {number|null} expire_in - Optional expiration filter in seconds.
     * @returns {Array} - List of points.
     */
    static getByUserId(user_id, expire_in = null) {
        const points = this._readFile();
        const now = new Date();
        return points.filter(
            (point) =>
                point.user_id === user_id &&
                (!expire_in ||
                    new Date(point.expire_date) <=
                        new Date(now.getTime() + expire_in * 1000))
        );
    }

    /**
     * Get total points for a user.
     * @param {string} user_id - The user ID.
     * @returns {number} - The total amount of points.
     */
    static totalPoint(user_id) {
        const points = this.getByUserId(user_id);
        return points.reduce((sum, point) => sum + point.amount, 0);
    }

    /**
     * Delete a point by ID.
     * @param {string} id - The ID of the point to delete.
     * @returns {boolean} - Whether the deletion was successful.
     */
    static delete(id) {
        try {
            const points = this._readFile();
            const updatedPoints = points.filter((point) => point.id !== id);
            this._writeFile(updatedPoints);
            return true;
        } catch (error) {
            console.error("Error deleting point by ID:", error);
            return false;
        }
    }

    /**
     * Delete points for a user based on the amount.
     * @param {string} user_id - The user ID.
     * @param {number} amount - The amount of points to delete.
     * @returns {boolean} - Whether the deletion was successful.
     */
    static deleteByUserId(user_id, amount) {
        const points = this.getByUserId(user_id);
        points.sort(
            (a, b) => new Date(a.expire_date) - new Date(b.expire_date)
        );

        let remaining = amount;

        for (const point of points) {
            if (remaining <= 0) break;

            if (point.amount <= remaining) {
                this.delete(point.id);
                remaining -= point.amount;
            } else {
                this.deduct(point.id, remaining);
                remaining = 0;
            }
        }

        return remaining === 0;
    }

    /**
     * Deduct points from a specific point entry.
     * @param {string} id - The ID of the point.
     * @param {number} deduction - The amount to deduct.
     * @returns {boolean} - Whether the deduction was successful.
     */
    static deduct(id, deduction) {
        try {
            const points = this._readFile();
            const point = points.find((p) => p.id === id);

            if (!point || point.amount < deduction) return false;

            point.amount -= deduction;
            this._writeFile(points);
            return true;
        } catch (error) {
            console.error("Error deducting points:", error);
            return false;
        }
    }
}

module.exports = SamplePointSys;
