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
        const price = rand(30) + 10;
        const camp = new Campground({
            location: `${cities[rand(1000)].city}, ${cities[rand(1000)].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: `https://picsum.photos/700/500?grayscale&blur=2`
            image: `https://picsum.photos/5${price}/7${50+price}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nobis incidunt suscipit officiis consequatur blanditiis! Ut eveniet ducimus libero distinctio veniam provident ullam praesentium ratione non delectus dolores consectetur, ipsam quaerat! Eum ullam quibusdam suscipit.',
            price: price
        });
        await camp.save();
    }
}
seedDB().then(() => db.close());
