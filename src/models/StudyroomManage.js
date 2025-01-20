const makeId = require("../utility/makeId");
const db = require("../database/db");

const TABLE_NAME = "studyroom";

class StudyroomManage {
    static async get(idOrName) {
        const query = {
            sql: `SELECT * FROM \`${TABLE_NAME}\` 
            WHERE id = ? OR name = ?`,
            values: [idOrName, idOrName],
        };

        try {
            const result = await db.query(query);
            return { success: true, ...(result?.[0] || null) };
        } catch (error) {
            console.error("Error fetching studyboard by ID or name", error);
            return { success: false, message: "Failed to fetch studyroom." };
        }
    }

    static async create(name, description = "") {
        const id = makeId();
        const created_at = Date.now();
        const query = {
            sql: `INSERT INTO \`${TABLE_NAME}\` 
            (id, name, description, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?)`,
            values: [id, name, description, created_at, created_at],
        };

        try {
            await db.query(query);
            return { success: true, id: id };
        } catch (error) {
            console.error("Error creating room:", error);
            return { success: false, message: "Failed to create studyroom." };
        }
    }

    static async update(id, name, description) {
        const updated_at = Date.now();
        const query = {
            sql: `UPDATE \`${TABLE_NAME}\` 
            SET name = ?, description = ?, updated_at = ? 
            WHERE id = ?`,
            values: [name, description, updated_at, id],
        };

        try {
            await db.query(query);
            return { success: true };
        } catch (error) {
            console.error("Error updating studyroom:", error);
            return { success: false, message: "Failed to update studyroom." };
        }
    }

    static async delete(id) {
        const query = {
            sql: `DELETE FROM \`${TABLE_NAME}\` 
            WHERE id = ?`,
            values: [id],
        };

        try {
            await db.query(query);
            return { success: true };
        } catch (error) {
            console.error("Error deleting studyroom:", error);
            return { success: false, message: "Failed to delete studyroom." };
        }
    }
}

module.exports = StudyroomManage;
