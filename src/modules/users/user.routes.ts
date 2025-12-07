import express from "express";
import { userControllers } from "./user.controller";
import auth from "../../middleware/auth";

const router = express.Router();

router.get("/", auth("admin"), userControllers.getAllUsers);

router.put("/:userId", auth("admin", "customer"), userControllers.updateUser);

router.delete("/:userId", auth("admin"), userControllers.deleteUser);

export const userRoutes = router;
