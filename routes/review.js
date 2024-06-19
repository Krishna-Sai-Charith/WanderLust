const express=require('express');
const router=express.Router({mergeParams:true});
const { reviewSchema } = require('../schema.js');
const Review = require("../models/reviews.js");
const wrapAsync=require('../utils/wrapAsync.js');
const ExpressError=require('../utils/ExpressError.js');
const Listing = require('../models/list.js');
const { isLoggedIn, isOwner, isAuthor } = require('../middleware.js');


// Custom middleware for backend validation of review
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errmsg, 400);
    }
    next();
}


// Reviews post route
router.post("/",isLoggedIn  ,validateReview,wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new review added for " + listing.title);
    req.flash("success", "Successfully made a new review!");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete review
router.delete("/:reviewId", isLoggedIn,isAuthor,wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    let deletedReview = await Review.findByIdAndDelete(reviewId);
    console.log(deletedReview);
    req.flash("success", "Successfully deleted a review!");
    res.redirect(`/listings/${id}`);
}));


module.exports = router;


