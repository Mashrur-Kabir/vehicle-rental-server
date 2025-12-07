"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = void 0;
const db_1 = require("../../config/db");
const getAllUsersFromDB = async () => {
    const result = await db_1.pool.query(`SELECT id, name, email, phone, role FROM users ORDER BY id ASC`);
    return result;
};
const updateUserIntoDB = async (name, email, phone, role, id) => {
    const result = await db_1.pool.query(`UPDATE users SET name=$1, email=$2, phone=$3, role=$4 WHERE id=$5 RETURNING name, email, phone, role`, [name, email, phone, role, id]);
    return result;
};
const deleteUserFromDB = async (id) => {
    const userResult = await db_1.pool.query(`SELECT * FROM users WHERE id = $1`, [
        id,
    ]);
    if (userResult.rowCount === 0) {
        return { success: false, reason: "NOT_FOUND" };
    }
    const activeBookings = await db_1.pool.query(`SELECT 1 FROM bookings WHERE customer_id = $1 AND status = 'active'`, [id]);
    if (activeBookings.rowCount > 0) {
        return { success: false, reason: "ACTIVE_BOOKINGS" };
    }
    const result = await db_1.pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [id]);
    return { success: true, data: result.rows[0] };
};
exports.userServices = {
    getAllUsersFromDB,
    updateUserIntoDB,
    deleteUserFromDB,
};
