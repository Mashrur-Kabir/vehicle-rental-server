import express, { Request, Response } from "express";
import initDB from "./config/db";
import logger from "./middleware/logger";
import { userRoutes } from "./modules/users/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { vehicleRoutes } from "./modules/vehicles/vehicle.routes";
import { bookingRoutes } from "./modules/bookings/booking.routes";

const app = express(); //creating express application

//(middlewares):
//parser
app.use(express.json()); //parsing json data from req body

//initializing DB:
initDB();

//for debugging purposes
app.get("/", logger, (req: Request, res: Response) => {
  res.send(
    "Hello World! Im using express with typescript. Its listening and changing thanks to tsx"
  );
});

//(modules):
//(users CRUD):
app.use("/api/v1/users", userRoutes);

//(vehicle CRUD)
app.use("/api/v1/vehicles", vehicleRoutes);

//(bookings CRUD)
app.use("/api/v1/bookings", bookingRoutes);

//(auth operation)
app.use("/api/v1/auth", authRoutes);

export default app;
