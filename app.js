const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const { get, redirect, download } = require('express/lib/response');
const { update } = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const wrappedAsync = require('./utils/wrappedAsync');
const res = require('express/lib/response');
const campground = require('./models/campground');
const {campgroundSchema, reviewSchema} = require('./schemas');
const Review = require('./models/review')



mongoose.connect('mongodb://localhost:27017/yell-o');

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("database Connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'))
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

app.get('/campgrounds', wrappedAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
})); 

app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/pending', (req, res) => {
    res.render('pending');
});

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.get('/campgrounds/:id', wrappedAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', {campground});
}));

app.post('/campgrounds', validateCampground, wrappedAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('More information required', 400);
    req.body.campground.image = `https://picsum.photos/501/374`;


    const newCamp = new Campground(req.body.campground);
    await newCamp.save();

    res.redirect(`/campgrounds/${newCamp._id}`);
}));

app.get('/campgrounds/:id/edit', wrappedAsync(async (req, res) => {
    const siteToEdit = await Campground.findById(req.params.id);
    res.render(`campgrounds/edit`, {siteToEdit});
}));

app.put('/campgrounds/:id', validateCampground, wrappedAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', wrappedAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    //was not working because I was passing an object to it!
    res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews', validateReview,  wrappedAsync(async (req, res) => {
    let campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', wrappedAsync( async (req, res) => {
    const {id, reviewId} = req.params;
    let campground = await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found, yo', 404));
});

app.use((err, req, res, next) => {
    if(!err.statusCode) err.statusCode = 500;
    if(!err.message) err.message = 'Oh No, something went wrong';
    // res.status(statusCode).send(message);
    res.status(err.statusCode).render('error', {err});
});

app.listen(3000, () => {
    console.log('serving on 3000');
});