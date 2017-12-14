var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require('request');
var logger = require('morgan');
var db = require('./models');
var PORT = 3000;
var axios = require('axios');
var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/mongoScraper', {
    useMongoClient:true
});

//Routes

app.get("/", function(req, res) {
    res.send("Hello world");
});

//get for scraping nytimes website
app.get('/scrape', function(req,res){
    request.get('https://www.reddit.com/r/nba/', function(err, response, html){
        var $ = cheerio.load(html);


        $("p.title").each(function(i, el){
            var title = $(el).text();
            var link = $(el).children().attr('href');

            var shortList = {
                title: title,
                link: link
            };

            console.log(shortList);

            db.Article
                .create(shortList)
                .then(function(dbArticle){
                    res.send("scrape complete");
                })
                .catch(function(err){
                    res.json(err);
                });
        });
    });
});

app.get("/index", function(req, res) {
    // Grab every document in the Articles collection
    db.Article
        .find({})
        .then(function(dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note
        .create(req.body)
        .then(function(dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function(dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});




