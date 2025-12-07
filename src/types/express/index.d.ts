import { JwtPayload } from "jsonwebtoken";

//type declaring file
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
