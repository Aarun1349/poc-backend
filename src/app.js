import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import coinRouter from "./routes/coin.route.js";
const app = express();

//middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
//routes

const port = process.env.PORT;
// app.use("/", (req, res) => {
//   res.status(200).json({ message: "app is running on port : ", port });
// });

app.use("/api/v1/users", userRouter);
app.use("/api/v1/coins", coinRouter);

export { app };
