import { pool } from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";

const signupUserLogic = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;

  const hashedPassword = await bcrypt.hash(password as string, 10);

  const result = await pool.query(
    `INSERT INTO users(name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING *`,
    [name, email, hashedPassword, phone, role]
  );
  return result;
};

const signinUserLogic = async (email: string, password: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return false;
  }

  const payload = {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, config.jwt_secret as string, {
    expiresIn: "7d",
  });

  return { token, user };
};

export const authServices = {
  signinUserLogic,
  signupUserLogic,
};
