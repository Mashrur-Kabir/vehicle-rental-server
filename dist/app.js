"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const logger_1 = __importDefault(require("./middleware/logger"));
const user_routes_1 = require("./modules/users/user.routes");
const auth_routes_1 = require("./modules/auth/auth.routes");
const vehicle_routes_1 = require("./modules/vehicles/vehicle.routes");
const booking_routes_1 = require("./modules/bookings/booking.routes");
const app = (0, express_1.default)(); //creating express application
//(middlewares):
//parser
app.use(express_1.default.json()); //parsing json data from req body
//initializing DB:
(0, db_1.default)();
//for debugging purposes
app.get("/", logger_1.default, (req, res) => {
    res.send("Hello World! Im using express with typescript. Its listening and changing thanks to tsx");
});
//(modules):
//(users CRUD):
app.use("/api/v1/users", user_routes_1.userRoutes);
//(vehicle CRUD)
app.use("/api/v1/vehicles", vehicle_routes_1.vehicleRoutes);
//(bookings CRUD)
app.use("/api/v1/bookings", booking_routes_1.bookingRoutes);
//(auth operation)
app.use("/api/v1/auth", auth_routes_1.authRoutes);
exports.default = app;
