// inspired by http://www.pixelhandler.com/blog/2012/02/09/develop-a-restful-api-using-node-js-with-express-and-mongoose/

var 
express = require("express"),
path = require("path"),
mongoose = require('mongoose');
	
// Config
var app = express();
var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send();
    }
    else {
      next();
    }
}
app.configure(function () {
	app.use(allowCrossDomain);
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	//app.use(express.static(path.join(__dirname, "public")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	app.use(app.router);
});

// Database
var generate_mongo_url = function(obj){
	obj.hostname = (obj.hostname || 'localhost');
	obj.port = (obj.port || 27017);
	obj.db = (obj.db || 'test');
	if(obj.username && obj.password){
		return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
	}
	else{
		return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
	}
}
var mongoURL;
if(process.env.MONGOLAB_URI){
	mongoURL = process.env.MONGOLAB_URI;
}
if(process.env.VCAP_SERVICES){
	var env = JSON.parse(process.env.VCAP_SERVICES);
	var mongo = env['mongodb-1.8'][0]['credentials'];
	mongoURL = generate_mongo_url(mongo);
}
else{
	var mongo = {
		"hostname":"localhost",
		"port":27017,
		"username":"",
		"password":"",
		"name":"",
		"db":"mixology"
	}
	mongoURL = generate_mongo_url(mongo);
}
console.log(mongoURL);

mongoose.connect(mongoURL);


/**
 * Generic Data query
 */

function registerAction (label, Model) {
	app.get('/api/' + label, function (request, response) {
		getBulk(request, response, Model);
	});
	app.post('/api/' + label, function (request, response) {
		createSingle(request, response, Model);
	});
	app.get('/api/' + label + '/:id', function (request, response) {
		getSingle(request, response, Model);
	});
	app.put('/api/' + label + '/:id', function (request, response) {
		updateSingle(request, response, Model);
	});
	app.delete('/api/' + label + '/:id', function (request, response) {
		deleteSingle(request, response, Model);
	});
}

function getBulk (request, response, Model) {
	var search;
	var sort;

	if(typeof request.query.search !== 'undefined'){
		try{
			search = JSON.parse(request.query.search);
		}
		catch(e) {
			console.log(e);
		}
	}

	if(typeof request.query.sort !== 'undefined'){
		try{
			sort = JSON.parse(request.query.sort);
		}
		catch(e) {
			console.log(e);
		}
	}
	
	Model
		.find(search)
		.sort(sort)
		.exec(function (error, results) {
			apiResponse(response, error, results);
	});
}
function getSingle (request, response, Model) {
	Model
		.findById(request.params.id)
		.exec(function (error, results) {
			apiResponse(response, error, results)
	});
}
function createSingle (request, response, Model) {
	var model = new Model(request.body);

	model.save(function (error, results) {
		console.log(error)
		apiResponse(response, error, results)
	});
}
function updateSingle (request, response, Model) {
	Model.findByIdAndUpdate(
		request.params.id, 
		request.body,
		function (error, results) {
			apiResponse(response, error, results)
	});
}
function deleteSingle (request, response, Model) {
	Model
		.findByIdAndRemove(request.params.id)
		.exec(function (error, results) {
			apiResponse(response, error, results)
	});
}
function apiResponse (response, error, results) {
	if (!error) response.send(results);
	else response.send({success: false});
}

var apiVersion = '1.0.0';
app.get('/api', function (req, res) {
	var hello = { 
		hi: 'Welcome to Mixology Data API ' + apiVersion,
		name: 'Mixology Data API',
		version: apiVersion,
	};
	res.send(hello);
});

var User = new mongoose.Schema({
	browser : {
		type: String
	},
	created: { 
		type: Date,
		default: Date.now
	}
});
registerAction('users', mongoose.model('User', User));
 
var Flavor = new mongoose.Schema({
	name: { 
		type: String,
		required: true,
		unique: true
	},
	color: {
		type: String
	},
	groups: [String],
	created: { 
		type: Date, 
		default: Date.now 
	},
});
registerAction('flavors', mongoose.model('Flavor', Flavor));
 
var Combination = new mongoose.Schema({
	flavorIds: [String],
	rating: { 
		type: Number, 
		enum: [0, 1, 2, 3, 4, 5],
		required: false,
		default: 0
	},
	comment: { 
		type: String
	},
	created: { 
		type: Date, 
		default: Date.now
	},
	userId: { 
		type: String
	}
});
registerAction('combinations', mongoose.model('Combination', Combination));

 
var apiVersion = '1.0.0';
app.get('/api', function (req, res) {
	var hello = { 
		hi: 'Welcome to Mixology Data API ' + apiVersion,
		name: 'Mixology Data API',
		version: apiVersion,
	};
	res.send(hello);
});
// Launch server
app.listen(process.env.VCAP_APP_PORT || process.env.PORT || 8000);