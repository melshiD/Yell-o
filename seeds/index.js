const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/yell-o');
const rand = nums => Math.floor(Math.random()*nums);

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("database Connected");
});

const sample = (helperList) => {
    return helperList[Math.floor(Math.random()*helperList.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i ++){
        const camp = new Campground({
            location: `${cities[rand(1000)].city}, ${cities[rand(1000)].state}`,
            description: `${sample(descriptors)} ${sample(places)}`
        });
        await camp.save();
    }
}
seedDB().then(() => db.close());