import { Router } from "express";
import {  convertUrl } from "../controllers/url.controller.js";

const urlRoute = Router();

urlRoute.route("/convert").get(convertUrl);

export default urlRoute;
