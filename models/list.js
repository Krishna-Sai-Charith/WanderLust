const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews.js');
const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: {
     type: String,
     set: (val) => val===""? "https://images.unsplash.com/photo-1718040506078-5a7b90746511?q=80&w=1177&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D":val
  },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  country: { type: String, required: true },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  owner:{
    type:Schema.Types.ObjectId,
    ref:'User'
  }
});

listingSchema.post('findOneAndDelete', async (listing)=> {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
})

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
