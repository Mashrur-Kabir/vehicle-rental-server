"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleServices = void 0;
const db_1 = require("../../config/db");
const createVehicleIntoDB = async (payload) => {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status, } = payload;
    const result = await db_1.pool.query(`INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES($1, $2, $3, $4, $5) RETURNING *`, [
        vehicle_name,
        type,
        registration_number,
        daily_rent_price,
        availability_status,
    ]);
    return result;
};
const getAllVehiclesFromDB = async () => {
    const result = await db_1.pool.query(`SELECT * FROM vehicles ORDER BY id ASC`);
    return result;
};
const getSingleVehicleFromDB = async (id) => {
    const result = await db_1.pool.query(`SELECT * FROM vehicles WHERE id = $1`, [id]);
    return result;
};
const updateVehicleIntoDB = async (vehicle_name, type, registration_number, daily_rent_price, availability_status, id) => {
    const result = await db_1.pool.query(`UPDATE vehicles SET vehicle_name=$1, type=$2, registration_number=$3, daily_rent_price=$4, availability_status=$5 WHERE id=$6 RETURNING *`, [
        vehicle_name,
        type,
        registration_number,
        daily_rent_price,
        availability_status,
        id,
    ]);
    return result;
};
const deleteVehicleFromDB = async (id) => {
    const checkAvailabilityStatus = await db_1.pool.query(`SELECT availability_status FROM vehicles WHERE id = $1`, [id]);
    if (checkAvailabilityStatus.rows.length === 0) {
        return {
            success: false,
            reason: "NO_VEHICLE",
        };
    }
    if (checkAvailabilityStatus.rows[0].availability_status === "booked") {
        return {
            success: false,
            reason: "BOOKED_VEHICLE",
        };
    }
    const result = await db_1.pool.query(`DELETE FROM vehicles WHERE id = $1`, [id]);
    return result;
};
exports.vehicleServices = {
    createVehicleIntoDB,
    getAllVehiclesFromDB,
    getSingleVehicleFromDB,
    updateVehicleIntoDB,
    deleteVehicleFromDB,
};
