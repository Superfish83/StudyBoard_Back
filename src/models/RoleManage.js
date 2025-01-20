const db = require("../database/db");
const makeId = require("../utility/makeId");
const UserManage = require("./UserManage");

TABLE_NAME = "user_room";

class RoleManage {
    static role = {
        OWNER: 0,
        ADMIN: 1,
        MEMBER: 2,
        INVITED: 3,
    };

    static async get(user_id, room_id) {
        const query = {
            sql: `SELECT * FROM \`${TABLE_NAME}\` 
            WHERE user_id = ? AND studyroom_id = ?`,
            values: [user_id, room_id],
        };

        try {
            const result = await db.query(query);
            return { success: true, ...(result?.[0] || null) };
        } catch (error) {
            console.error("Error fetching role:", error);
            return { success: false, message: "Failed to fetch role." };
        }
    }

    /**
     * This method assigns a role to a user. Preexisting role of a user will be overwritten.
     * WARNING: This method does NOT check if id and room are valid.
     * @param {string} user
     * @param {string} room
     * @param {number} role
     * @returns
     */
    static async assgin(user_id, room_id, role) {
        const role_check = await this.get(user_id, room_id);
        let query;
        const updated_at = Date.now();
        if (role_check.success) {
            query = {
                sql: `UPDATE \`${TABLE_NAME}\` 
                SET role = ? , updated_at = ?
                WHERE user_id = ? AND studyroom_id = ?`,
                values: [role, updated_at, user_id, room_id],
            };
        } else {
            const id = makeId();
            query = {
                sql: `INSERT INTO \`${TABLE_NAME}\` 
                (id, user_id, studyroom_id, role, updated_at, created_at) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                values: [id, user_id, room_id, role, updated_at, updated_at],
            };
        }

        try {
            await db.query(query);
            return { success: true };
        } catch (error) {
            console.error("Error assigning role:", error);
            return { success: false, message: "Failed to assign role." };
        }
    }

    static async delete(user_id, room_id) {
        const query = {
            sql: `DELETE FROM \`${TABLE_NAME}\` 
            WHERE user_id = ? AND studyroom_id = ?`,
            values: [user_id, room_id],
        };
        try {
            await db.query(query);
            return { success: true };
        } catch (error) {
            console.error("Error deleting role:", error);
            return { success: false, message: "Failed to delete role." };
        }
    }

    static async deleteRoom(room_id) {
        const query = {
            sql: `DELETE FROM \`${TABLE_NAME}\` 
            WHERE studyroom_id = ?`,
            values: [room_id],
        };
        try {
            await db.query(query);
            return { success: true };
        } catch (error) {
            console.error("Error deleting role:", error);
            return { success: false, message: "Failed to delete role." };
        }
    }
}

module.exports = RoleManage;
