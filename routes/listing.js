const express=require('express');
const router=express.Router();
const listing = require("../models/list.js");
const {listingSchema}=require('../schema.js');
const ExpressError=require('../utils/ExpressError.js');
const wrapAsync=require('../utils/wrapAsync.js');
const reviewRouter = require('./review.js');
const {isLoggedIn, isOwner}=require('../middleware.js');



// Custom middleware for backend validation of listing
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errmsg, 400);
    }
    next();
}

// Index route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await listing.find({});
    res.render("listings/index", { allListings });
}));

// New route for creating new listing
router.get("/new",isLoggedIn ,(req, res) => {
    res.render("listings/new.ejs");
});

// Create route
router.post("/", isLoggedIn,validateListing,wrapAsync(async (req, res, next) => {
    const newListing = new listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Successfully made a new listing!");
    res.redirect("/listings");
}));

// Edit route which renders a form for editing
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async (req, res) => {
    let { id } = req.params;
    const singleListing = await listing.findById(id);
    if(!singleListing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/edit", { singleListing });
}));

// Update route 
router.put("/:id", isLoggedIn ,isOwner,validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Successfully updated a listing!");
    res.redirect(`/listings/${id}`);
}));

// Read operation or show route for single listing
router.get("/:id", wrapAsync(async (req, res) => {
    const singleListing = await listing.findById(req.params.id).populate({path:"reviews",populate:{
        path:"author"
    }}).populate("owner");
    if(!singleListing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    console.log(singleListing);
    res.render("listings/show", { singleListing });
}));

// Use the review router for nested routes
router.use("/:id/reviews", reviewRouter);

// Delete 
router.delete("/:id", isLoggedIn,isOwner,wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Successfully deleted a listing!");
    res.redirect("/listings");
}));

module.exports=router;