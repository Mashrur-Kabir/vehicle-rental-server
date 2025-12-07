"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userControllers = void 0;
const user_service_1 = require("./user.service");
const getAllUsers = async (req, res) => {
    try {
        const result = await user_service_1.userServices.getAllUsersFromDB();
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result.rows,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
const updateUser = async (req, res) => {
    const { name, email, phone, role } = req.body;
    try {
        const result = await user_service_1.userServices.updateUserIntoDB(name, email, phone, role, req.params.userId);
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
const deleteUser = async (req, res) => {
    try {
        const result = await user_service_1.userServices.deleteUserFromDB(req.params.userId);
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.userControllers = {
    getAllUsers,
    updateUser,
    deleteUser,
};
