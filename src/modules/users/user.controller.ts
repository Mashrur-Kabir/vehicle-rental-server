import { Request, Response } from "express";
import { userServices } from "./user.service";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getAllUsersFromDB();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { name, email, phone, role } = req.body;

  try {
    const result = await userServices.updateUserIntoDB(
      name,
      email,
      phone,
      role,
      req.params.userId!
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `User with id ${req.params.userId} not found!`,
      });
    }

    res.status(200).json({
      success: true,
      message: `User updated successfully!`,
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.deleteUserFromDB(req.params.userId!);

    if (result.success === false) {
      if (result.reason === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: `User with id ${req.params.userId} not found!`,
        });
      }
      if (result.reason === "ACTIVE_BOOKINGS") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete user with active bookings",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const userControllers = {
  getAllUsers,
  updateUser,
  deleteUser,
};
