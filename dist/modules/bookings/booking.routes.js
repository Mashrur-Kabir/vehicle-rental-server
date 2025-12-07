"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const booking_controller_1 = require("./booking.controller");
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)("admin", "customer"), booking_controller_1.bookingControllers.createBooking);
router.get("/", (0, auth_1.default)("admin", "customer"), booking_controller_1.bookingControllers.getAllBookings);
router.get("/:bookingId", (0, auth_1.default)("admin"), booking_controller_1.bookingControllers.getSingleBooking);
router.put("/:bookingId", (0, auth_1.default)("admin", "customer"), booking_controller_1.bookingControllers.updateBooking);
router.delete("/:bookingId", (0, auth_1.default)("admin"), booking_controller_1.bookingControllers.deleteBooking);
exports.bookingRoutes = router;
