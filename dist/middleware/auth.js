"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const auth = (...roles) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_secret);
            console.log({ decoded });
            req.user = decoded;
            const requestedUserId = req.params.userId || req.body?.customer_id;
            const loggedInUserId = decoded.id;
            const userRole = decoded.role;
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(500).json({
                    error: "Unauthorized personnel!",
                });
            }
            if (userRole === "customer" && requestedUserId) {
                if (requestedUserId &&
                    String(requestedUserId) !== String(loggedInUserId)) {
                    return res.status(403).json({
                        success: false,
                        message: "Customers can only access or modify their own data.",
                    });
                }
            }
            next();
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    };
};
exports.default = auth;
