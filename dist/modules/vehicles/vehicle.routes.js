"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const vehicle_controller_1 = require("./vehicle.controller");
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)("admin"), vehicle_controller_1.vehicleControllers.createVehicle);
router.get("/", vehicle_controller_1.vehicleControllers.getAllVehicles);
router.get("/:vehicleId", vehicle_controller_1.vehicleControllers.getSingleVehicle);
router.put("/:vehicleId", (0, auth_1.default)("admin"), vehicle_controller_1.vehicleControllers.updateVehicle);
router.delete("/:vehicleId", (0, auth_1.default)("admin"), vehicle_controller_1.vehicleControllers.deleteVehicle);
exports.vehicleRoutes = router;
