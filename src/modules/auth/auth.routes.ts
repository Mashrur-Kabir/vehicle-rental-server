import express from "express";
import { authController } from "./auth.controller";

const router = express.Router();

router.post("/signup", authController.signupUser);

router.post("/signin", authController.signinUser);

export const authRoutes = router;
