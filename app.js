const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const { get, redirect } = require('express/lib/response');
const { update } = require('./models/campground');


mongoose.connect('mongodb://localhost:27017/yell-o');

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("database Connected");
});

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}); 

app.get('/', (req, res) => {
    res.render('home');
});
           
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.get('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', {campground});
});

app.post('/campgrounds', async (req, res) => {
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    console.log(newCamp);
    res.redirect(`/campgrounds/${newCamp._id}`);
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const siteToEdit = await Campground.findById(req.params.id);
    res.render(`campgrounds/edit`, {siteToEdit});
});

app.put('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground}, {new: true});
    res.redirect(`/campgrounds/${campground._id}`);
});

app.listen(3000, () => {
    console.log('serving on 3000');
});
