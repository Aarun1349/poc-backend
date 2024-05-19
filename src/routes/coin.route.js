import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getUserCoins, updateCoins } from "../controllers/coins.controller.js";

const coinRouter = Router();
//secured routes
coinRouter.route("/getcoins").get(verifyJWT, getUserCoins);
coinRouter.route("/update").patch(verifyJWT, updateCoins);
export default coinRouter;