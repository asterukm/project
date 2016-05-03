var express = require('express');
var app = express();
var mongoose = require('mongoose');
var assert = require('assert');

mongoose.connect('mongodb://localhost/test');

var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('json spaces', 6);

var methodOverride = require('method-override');//override get/post to put/delete

app.use(methodOverride(function(req, res){
  if (req.query && typeof req.query === 'object' && '_method' in req.query) {
    var method = req.query._method;
    return method;

  }
}));

//Schema
var restauarntsSchema = new mongoose.Schema({

    address: 
    {
		building: String,
	/*     
		eggs: {
        type: Number,
        min: [6, 'Too few eggs'],
        max: 12
      }
      */
		coord: [
			{
				lon:Number,
				lat:Number
			}
				],
		street: String,
		zipcode: String
	},
	brought: String,
	cuisine: String,
	grades: [
		{
			date:  { type: Date, default: Date.now },
			grade: String,
			score: Number
		}
	],			
	name:  {type: String, validate: /[a-z]/},
	restaurant_id: String

});
var restaurantsCollection = mongoose.model( 'restaurants', restauarntsSchema, 'restaurants');


//////////////////////////////////////index
app.get('/', function(req,res) {
    res.sendFile(__dirname + '/public/index.html');
});

//////////////////////////////////////insert
app.get('/insert', function(req,res) {
	res.render('insert');
	res.end();
});

app.get('/doInsert', function(req,res) {
	var restaurant_id = req.body.restaurant_id;
	res.redirect('/insert/'+restaurant_id);
});


app.post('/insert', function(req,res) {
	var name = req.body.name;
	var building = req.body.building;
	var street = req.body.street;
	var zipcode = req.body.zipcode;
	var lon = req.body.lon;
	var lat = req.body.lat;
	var brought = req.body.brought;
	var cuisine = req.body.cuisine;
	var date =  req.body.date;
	var grade = req.body.grade;
	var score = req.body.score;
	var restaurant_id = req.body.restaurant_id;
	
	var insertRestaurants = new restaurantsCollection({
    	address: 
    	{
		building: building,
		coord: [
			{
				lon:lon,
				lat:lat
			}
				],
		street: street,
		zipcode: zipcode
		},
		brought: brought,
		cuisine: cuisine,
		grades: 
		[
			{
			date:  date,
			grade: grade,
			score: score
			}
		],			
		name: name,
		restaurant_id: restaurant_id

		});
	insertRestaurants.save(function(err){
      if (err) return handleError(err);
	});
	res.render('insert_done');
	res.end();
});

//////////////////////////////////////Read all data
app.get('/read/all', function(req,res) {
	 restaurantsCollection.find({}, function(err, result){
 	if  ( err ) throw err;  
 	res.json(result);
 	});
});
//////////////////////////////////////Read ONE data

app.get('/read', function(req,res) {
    res.sendFile(__dirname + '/public/read_one_form.html');
});

app.get('/doReadOne', function(req,res) {

	var restaurant_id = req.query.restaurant_id;
	res.redirect('/read/'+restaurant_id);	//change ?= to /	
	res.end();
});


app.get('/read/:restaurant_id', function(req,res) {
	var restaurant_id = req.params.restaurant_id; 
 	restaurantsCollection.find({restaurant_id: restaurant_id}, function(err, result){
 	if  ( err ) throw err;
 	if(!result){
      				res.json({
        			message:"Restaurant ID: "+restaurant_id + "NOT found.",
      				});
				}else{

					res.json(result);
				}
  	
	});

	//res.render('read_done');
});
//////////////////////////////////////Update 

app.get('/update', function(req,res) {
    res.sendFile(__dirname + '/public/update_form.html');	
});


app.post('/update', function(req,res) {
	var restaurant_id = req.body.restaurant_id;
	var name = req.body.name;
	var building = req.body.building;
	var street = req.body.street;
	var zipcode = req.body.zipcode;
	var lon = req.body.lon;
	var lat = req.body.lat;
	var brought = req.body.brought;
	var cuisine = req.body.cuisine;
	var date =  req.body.date;
	var grade = req.body.grade;
	var score = req.body.score;

	 // Set our collection

    restaurantsCollection.findOneAndUpdate(
        {restaurant_id: restaurant_id}, // query
            //[['_id', 'asc']],  // sort order
        {
        $set: {
        address: 
    	{
		building: building,
		coord: [
			{
				lon:lon,
				lat:lat
			}
				],
		street: street,
		zipcode: zipcode
		},
		brought: brought,
		cuisine: cuisine,
		grades: 
		[
			{
			date:  date,
			grade: grade,
			score: score
			}
		],			
		name: name,
		restaurant_id: restaurant_id
                }
        }, // replacement
        { safe: true, upsert: true },
		function(err, result){
 		if  ( err ) throw err; 
		if(result){
      				res.json({
        			message:"Restaurant ID: "+restaurant_id + "is Updated.",
      				});
				}else{
					res.json({
					message:"Restaurant ID: "+restaurant_id + "is NOT Updated.",
					});
				}
  	
	});
});


//////////////////////////////////////Delete
/////////////////////////////Use get method with hyperlink to do delete
app.get('/delete', function(req,res) {
    res.sendFile(__dirname + '/public/delete_form.html');
});

app.get('/doDelete', function(req,res) {

	var restaurant_id = req.query.restaurant_id;
	
	res.redirect('/delete/'+restaurant_id);	//change ?= to /	
	res.end();
});

app.get('/delete/:restaurant_id', function(req,res) {

	var restaurant_id = req.params.restaurant_id; // / params to get hyperlink /:restaurant_id
 	restaurantsCollection.remove({restaurant_id}, function(err, result){
 	if  ( err ) throw err; 
  	res.json({
  		
        message:"Deleted Restaurant ID:" + restaurant_id,
        restaurant:result
         

      });
  	
	});
	
});
//////////////////////////////////////Port
app.listen(process.env.PORT || 8099);
