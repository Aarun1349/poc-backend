import { Router } from "express";
import {  compile } from "../controllers/compiler.controller.js";

const compilerRoute = Router();

compilerRoute.route("/compile").post(compile);

export default compilerRoute;
