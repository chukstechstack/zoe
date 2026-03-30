import express from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";
import mainRouter from "./mainRouter.js";
import passport from "./config/passport.js";
import session from "express-session";
import fs from "fs";
import https from "https";
// import crypto from "crypto";

dotenv.config();
const app = express();

// const sessionSecret = crypto.randomBytes(64).toString('hex');
// console.log(sessionSecret)

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 3000;

app.use("/api", mainRouter);

const startServer = async () => {
  try {
    await pool.connect();
    console.log("✅ Connected to Supabase PostgreSQL");

    https
      .createServer(
        {
          key: fs.readFileSync("localhost-key.pem"),
          cert: fs.readFileSync("localhost.pem"),
        },
        app,
      )
      .listen(PORT, () => {
        console.log(`🚀 Server running at https://localhost:${PORT}`);
      });
  } catch (err) {
    console.error("❌ Failed to connect:", err.message);
    process.exit(1);
  }
};

startServer();
