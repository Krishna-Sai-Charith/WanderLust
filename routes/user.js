const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');


router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", async (req, res) => {
    try{
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, err => {
        if(err) return next(err);
        req.flash("success", "Welcome to WanderLust!");
        res.redirect("/listings");
    });
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
    
});

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", saveRedirectUrl
    ,passport.authenticate("local", { failureFlash: true, failureRedirect: "/login"}),async(req, res) => {
    req.flash("success", "Welcome Back!");
    let redirectUrl = req.session.returnTo || "/listings";
    res.redirect(res.locals.redirectUrl || "/listings");
});

router.get("/logout", (req, res,next) => {
    req.logout((err)=>{
        if(err) return next(err);
    });
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
});

module.exports=router;