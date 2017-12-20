var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require('request');
var logger = require('morgan');
var db = require('./models');
var PORT = process.env.PORT || 8080;
var app = express();
var exphbs = require("express-handlebars");
var path = require('path');

app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set('view engine', 'handlebars'); // set up hbs for templating

mongoose.Promise = Promise;
// mongoose.connect('mongodb://carrendale:charlie@ds141796.mlab.com:41796/mongoscraper', {
//     useMongoClient:true
// });

var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
//(Focus on This Variable)
var url = 'mongodb://carrendale:charlie@ds141796.mlab.com:41796/mongoscraper';

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connection established to', url);

        // do some work here with the database.

        //Close connection
        //db.close();
    }
});

//mlab config
// export MONGOLAB_URI='mongodb://carrendale:charlie@ds141796.mlab.com:41796/mongoscraper';
// var url = process.env.MONGOLAB_URI;


//Routes
app.get("/", function(req, res) {
    res.render("index");
});

//get for scraping reddit/nba website
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
                    res.send('Scrape complete');
                    res.redirect('/');
                })
                .catch(function(err){
                    res.json(err);
                });
        });
    });
});

app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article
        .find({})
        .then(function(dbArticle) {
            // If we were able to successfully find Articles, send them back to the client'
            res.json(dbArticle);
            //res.render('index.html', {title: 'article scrapper', article_data: data});
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article
        .findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function(dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
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
//
app.get("/notes/", function(req, res) {
    db.Note
        .find({})
        .then(function(data) {
            // If we were able to successfully find notes, send back to the client
            // res.json(dbNote);
            res.json(data);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

//update route
// app.update("/notes/:id", function(req,res){
//     db.Note
//         .update({
//             "_id": mongojs.ObjectId(req.params.id)
//         },
//             {
//                 // Set the title, note and modified parameters
//                 // sent in the req's body.
//                 $set: {
//                     "title": req.body.title,
//                     "body": req.body.body,
//                     "modified": Date.now()
//                 }
//             }, function(err, edited){
//                 if (err) {
//                     console.log(err);
//                     res.send(err);
//                 }else{
//                     console.log(edited);
//                     //this may need to render
//                     res.send("savedNotes", edited);
//                 }
//             }
//
//         )
//
// });
//delete route
app.delete("/notes/:id", function(req,res){
    db.Note.remove({
        "_id": mongojs.ObjectID(req.params.id)
    }, function(error, removed) {
        // Log any errors from mongojs
        if (error) {
            console.log(error);
            res.send(error);
        }
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        else {
            console.log(removed);
            res.send(removed);
        }
    });
});

app.get('/savedNotes', function(req,res){
    res.render('savedNotes', {data:req.data});
});


app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});




