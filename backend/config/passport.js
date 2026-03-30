import bcryptjs from "bcryptjs";
import pool from "../config/db.js";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

passport.use(
  "local",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const result = await pool.query(
          ` SELECT id, username, email, password from profiles WHERE email = $1`,
          [email],
        );

        if (result.rows.length === 0) {
          return done(null, false, { message: "User not found" });
        }

        const user = result.rows[0];

        const isValid = await bcryptjs.compare(password, user.password);
        if (isValid) {
          delete user.password;
          return done(null, user);
        } else {
          return done(null, false, { message: "incorrect Password" });
        }
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      ` SELECT id, username, email from profiles WHERE id = $1 `,
      [id],
    );
    if (result.rows.length === 0) return done(null, false);
    done(null, result.rows[0]);
  } catch (err) {
    return done(err);
  }
});



export default passport;
