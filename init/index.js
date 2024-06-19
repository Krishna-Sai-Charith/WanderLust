const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/list.js");

async function main() {
    await mongoose.connect('mongodb://localhost:27017/wanderlust');
}
main().then(()=>{
    console.log('Connected to MongoDB');
}).catch((err)=>{
    console.log(err);
})

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj, owner:"66727d3597ce4ccf9bc7aa58"}));
    await Listing.insertMany(initData.data);
    console.log("Database seeded");
}
initDB();