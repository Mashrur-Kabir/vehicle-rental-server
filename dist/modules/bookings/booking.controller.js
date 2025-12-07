"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingControllers = void 0;
const booking_service_1 = require("./booking.service");
const createBooking = async (req, res) => {
    try {
        const result = await booking_service_1.bookingServices.createBookingIntoDB(req.body);
        if ("success" in result) {
            if (result.reason === "NO_VEHICLE") {
                return res.status(404).json({
                    success: false,
                    message: `vehicle not found!`,
                });
            }
            if (result.reason === "BOOKED_VEHICLE") {
                return res.status(400).json({
                    success: false,
                    message: "vehicle is already booked!",
                });
            }
        }
        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: result,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
const getAllBookings = async (req, res) => {
    await booking_service_1.bookingServices.autoReturnVehiclesAfterExpiry();
    try {
        const userRole = req.user?.role;
        const userId = req.user?.id;
        let result;
        if (userRole === "admin") {
            result = await booking_service_1.bookingServices.getAllBookingsFromDB();
        }
        else if (userRole === "customer") {
            result = await booking_service_1.bookingServices.getBookingsForCustomerFromDB(userId); //for everything the user booked
        }
        if (!result) {
            return res.status(403).json({
                success: false,
                message: "No data available",
            });
        }
        //date formatting:
        const formattedResult = result.map((i) => ({
            ...i,
            rent_start_date: new Date(i.rent_start_date).toISOString().split("T")[0],
            rent_end_date: new Date(i.rent_end_date).toISOString().split("T")[0],
        }));
        return res.status(200).json({
            success: true,
            message: userRole === "admin"
                ? "Bookings retrieved successfully"
                : "Your bookings retrieved successfully",
            data: formattedResult,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
const getSingleBooking = async (req, res) => {
    //for a certain id
    await booking_service_1.bookingServices.autoReturnVehiclesAfterExpiry();
    try {
        const booking = await booking_service_1.bookingServices.getSingleBookingFromDB(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `Booking with id ${req.params.bookingId} not found!`,
            });
        }
        res.status(200).json({
            success: true,
            message: "Booking retrieved successfully",
            data: [booking],
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
const updateBooking = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const { status } = req.body;
        const userRole = req.user?.role; // customer / admin
        const userId = req.user?.id;
        if (status !== "cancelled" && status !== "returned") {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'cancelled' or 'returned'",
            });
        }
        const result = await booking_service_1.bookingServices.updateBookingStatusInDB(bookingId, status, userRole, userId);
        if (result === "NOT_FOUND") {
            return res
                .status(404)
                .json({ success: false, message: "Booking not found" });
        }
        if (result === "FORBIDDEN") {
            return res.status(403).json({
                success: false,
                message: "Not allowed to perform this action",
            });
        }
        return res.status(200).json({
            success: true,
            message: status === "cancelled"
                ? "Booking cancelled successfully"
                : "Booking marked as returned. Vehicle is now available",
            data: result,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const deleteBooking = async (req, res) => {
    try {
        const result = await booking_service_1.bookingServices.deleteBookingFromDB(req.params.bookingId);
        if ("success" in result) {
            if (result.reason === "NO_VEHICLE") {
                return res.status(404).json({
                    success: false,
                    message: `booking with id ${req.params.bookingId} not found!`,
                });
            }
            if (result.reason === "BOOKED_VEHICLE") {
                return res.status(400).json({
                    success: false,
                    message: `booking with id ${req.params.bookingId} is booked!`,
                });
            }
        }
        res.status(200).json({
            success: true,
            message: `booking deleted successfully`,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.bookingControllers = {
    createBooking,
    getAllBookings,
    getSingleBooking,
    updateBooking,
    deleteBooking,
};
