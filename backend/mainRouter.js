import express from "express";
import taskRouter from "./Routes/taskRoute.js";
import authRouter from "./Routes/authRoute.js";

const mainRouter = express.Router();

mainRouter.use("/tasks", taskRouter);
mainRouter.use("/", authRouter);


export default mainRouter