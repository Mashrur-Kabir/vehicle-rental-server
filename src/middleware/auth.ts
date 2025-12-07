import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const decoded = jwt.verify(
        token,
        config.jwt_secret as string
      ) as JwtPayload;

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
        if (
          requestedUserId &&
          String(requestedUserId) !== String(loggedInUserId)
        ) {
          return res.status(403).json({
            success: false,
            message: "Customers can only access or modify their own data.",
          });
        }
      }

      next();
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
};

export default auth;
