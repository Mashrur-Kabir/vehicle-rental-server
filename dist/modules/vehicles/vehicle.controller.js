"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleControllers = void 0;
const vehicles_service_1 = require("./vehicles.service");
const createVehicle = async (req, res) => {
    try {
        const result = await vehicles_service_1.vehicleServices.createVehicleIntoDB(req.body);
        res.status(201).json({
            success: true,
            message: "Vehicle created successfully!",
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
const getAllVehicles = async (req, res) => {
    try {
        const result = await vehicles_service_1.vehicleServices.getAllVehiclesFromDB();
        res.status(200).json({
            success: true,
            message: result.rowCount === 0
                ? "No vehicles found"
                : "Vehicles retrieved successfully",
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
const getSingleVehicle = async (req, res) => {
    try {
        const result = await vehicles_service_1.vehicleServices.getSingleVehicleFromDB(req.params.vehicleId);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `vehicle with id ${req.params.vehicleId} not found!`,
            });
        }
        res.status(200).json({
            success: true,
            message: `vehicle retrieved successfully`,
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
const updateVehicle = async (req, res) => {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status, } = req.body;
    try {
        const result = await vehicles_service_1.vehicleServices.updateVehicleIntoDB(vehicle_name, type, registration_number, daily_rent_price, availability_status, req.params.vehicleId);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `vehicle with id ${req.params.vehicleId} not found!`,
            });
        }
        res.status(200).json({
            success: true,
            message: `vehicle updated successfully!`,
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
const deleteVehicle = async (req, res) => {
    try {
        const result = await vehicles_service_1.vehicleServices.deleteVehicleFromDB(req.params.vehicleId);
        if ("success" in result) {
            if (result.reason === "NO_VEHICLE") {
                return res.status(404).json({
                    success: false,
                    message: `vehicle with id ${req.params.vehicleId} not found!`,
                });
            }
            if (result.reason === "BOOKED_VEHICLE") {
                return res.status(400).json({
                    success: false,
                    message: `vehicle with id ${req.params.vehicleId} is booked!`,
                });
            }
        }
        res.status(200).json({
            success: true,
            message: `Vehicle deleted successfully`,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.vehicleControllers = {
    createVehicle,
    getAllVehicles,
    getSingleVehicle,
    updateVehicle,
    deleteVehicle,
};
