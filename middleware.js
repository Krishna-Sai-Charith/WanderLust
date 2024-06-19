const Listing = require("./models/list.js");
const Review = require("./models/reviews.js");

module.exports.isLoggedIn = (req, res, next) => {

    if(!req.isAuthenticated()){
        //redirected url
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to add a listing!");
         return res.redirect("/login")
        }
    next();
}

module.exports.saveRedirectUrl= (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner= async(req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You cannot edit this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.isAuthor=async(req, res, next) => {
    let { reviewId } = req.params;
    let { id } = req.params;
    let listing = await Review.findById(reviewId);
    if(!listing.author._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You cannot delete this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}