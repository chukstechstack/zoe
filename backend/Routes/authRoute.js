import bcryptjs from "bcryptjs"
import pool from "../config/db.js";
import express from "express";
import passport from "../config/passport.js";




const authRouter = express.Router();
const saltRound = 10;

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/api/login')
}
authRouter.post("/register", async (req, res) => {

  let {
    username,
    password,
    first_name,
    last_name,
    country,
    email,
    google_id,
    avatar_url,
  } = req.body;

  username = username?.trim();
  password = password?.trim();
  first_name = first_name?.trim();
  last_name = last_name?.trim();
  country = country?.trim();
  email = email?.trim();
  google_id = google_id?.trim();
  avatar_url = avatar_url?.trim();

  try {
    const checkUser = await pool.query(
      `select * from profiles where email = $1`,
      [email],
    );

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ msg: "user already exisit" });
    }
    const hash = await bcryptjs.hash(password, saltRound);
    const queryText = `insert into profiles(  
username,
password,
first_name,
last_name,
country,
email,
google_id, 
avatar_url
) values($1, $2, $3, $4, $5, $6, $7,$8) RETURNING id`;

    const values = [
      username,
      hash,
      first_name,
      last_name,
      country,
      email,
      google_id,
      avatar_url,
    ];
    console.log(req.body)
    const result = await pool.query(queryText, values);
    const User = { id: result.rows[0].id, username, email } // const {password: _, ...userWithoutPassword } = newuser;
    // res.status(201).json(userWithoutPassword)
    req.login(User, (err) => {
      if (err) return res.status(500).send('login failed')
      res.redirect('/api/home')
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: error.message });
  }
});
authRouter.post('/login', passport.authenticate('local', {
  successRedirect: "/api/home",
  failureRedirect: "/api/login",
  failureMessage: true
}));

authRouter.get('/login', (req, res) => {
  res.send("Please log in by sending your email and password via POST to this URL.");
});

authRouter.get('/home', ensureAuthenticated, (req, res) => {
  res.send(`Welcome ${req.user.username}`)
})


authRouter.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

   

      res.clearCookie('connect.sid', { 
      path: '/', 
      httpOnly: true, 
      secure: false, // Match your local testing setting
      sameSite: 'lax' 
    });

      req.session.regenerate((err) => {
        if(err) return next(err)
      })

      res.redirect("/api/login");
    });
  });


export default authRouter

