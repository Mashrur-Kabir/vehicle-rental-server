import { pool } from "../../config/db";

const getAllUsersFromDB = async () => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role FROM users ORDER BY id ASC`
  );
  return result;
};

const updateUserIntoDB = async (
  name: string,
  email: string,
  phone: string,
  role: string,
  id: string
) => {
  const result = await pool.query(
    `UPDATE users SET name=$1, email=$2, phone=$3, role=$4 WHERE id=$5 RETURNING name, email, phone, role`,
    [name, email, phone, role, id]
  );
  return result;
};

const deleteUserFromDB = async (id: string) => {
  const userResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [
    id,
  ]);

  if (userResult.rowCount === 0) {
    return { success: false, reason: "NOT_FOUND" };
  }
  const activeBookings: any = await pool.query(
    `SELECT 1 FROM bookings WHERE customer_id = $1 AND status = 'active'`,
    [id]
  );

  if (activeBookings.rowCount > 0) {
    return { success: false, reason: "ACTIVE_BOOKINGS" };
  }

  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [id]
  );

  return { success: true, data: result.rows[0] };
};

export const userServices = {
  getAllUsersFromDB,
  updateUserIntoDB,
  deleteUserFromDB,
};
