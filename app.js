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
      res.send(200);
    }
    else {
      next();
    }
}
app.configure(function () {
	app.use(allowCrossDomain);
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, "public")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Database
if(process.env.VCAP_SERVICES){
	var env = JSON.parse(process.env.VCAP_SERVICES);
	var mongo = env['mongodb-1.8'][0]['credentials'];
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
}
console.log(mongo);
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
var mongourl = generate_mongo_url(mongo);
mongoose.connect(mongourl);


// Schemas
var Schema = mongoose.Schema;

var User = new Schema({
	created: { type: Date, default: Date.now }
});
var UserModel = mongoose.model('User', User);
 
var FoodItem = new Schema({
	name: { 
		type: String,
		required: true,
		unique: true
	},
	color: {
		type: String
	},
	created: { type: Date, default: Date.now },
});
var FoodItemModel = mongoose.model('FoodItem', FoodItem);
 
var Combination = new Schema({
	foodItemIds: [Schema.Types.ObjectId],
	rating: { 
			type: Number, 
			enum: [1, 2, 3, 4, 5],
			required: false
	},
	comment: { type: String },
	created: { type: Date, default: Date.now },
	userId: { type: Schema.Types.ObjectId }
});
var CombinationModel = mongoose.model('Combination', Combination);

 
var apiVersion = '1.0.0';
app.get('/api', function (req, res) {
	var hello = { 
		hi: 'Welcome to Mixology Data API ' + apiVersion,
		name: 'Mixology Data API',
		version: apiVersion,
	};
	res.send(hello);
});
 
/**
 * FoodItems ---------------------------------------------------------
 */ 
app.get('/api/foodItems', function (req, res) {
	FoodItemModel
		.find()
		.sort({color:1}).
		exec(function (err, foodItems) {
		if (!err) {
			return res.send(foodItems);
		} else {
			return res.send({success: false});
		}
	});
});
app.post('/api/foodItems', function (req, res) {
	var foodItem;
	
	foodItem = new FoodItemModel({
		name: req.body.name,
		color: req.body.color
	});

	foodItem.save(function (err) {
		if (!err) {
			return res.send(foodItem);
		} else {
			return res.send({success: false});
		}
	});
});
app.get('/api/foodItems/:id', function (req, res) {
	FoodItemModel.findById(req.params.id, function (err, foodItem) {
		if (!err) {
			return res.send(foodItem);
		} else {
			return res.send({success: false});
		}
	});
});
app.put('/api/foodItems/:id', function (req, res) {
	FoodItemModel.findById(req.params.id, function (err, foodItem) {
		console.log(req.body)
		foodItem.name = req.body.name;
		foodItem.color = req.body.color;
		foodItem.save(function (err) {
			if (!err) {
				return res.send(foodItem);
			} else {
				return res.send({success: false});
			}
		});
	});
});
app.delete('/api/foodItems/:id', function (req, res) {
	FoodItemModel.findById(req.params.id, function (err, foodItem) {
		foodItem.remove(function (err) {
			if (!err) {
				return res.send(foodItem);
			} else {
				return res.send({success: false});
			}
		});
	});
});

/**
 * Users ---------------------------------------------------------
 */ 
app.get('/api/users', function (req, res) {
	UserModel
		.find()
		.sort({created:1}).
		exec(function (err, result) {
		if (!err) {
			return res.send(result);
		} else {
			return res.send({success: false});
		}
	});
});
app.post('/api/users', function (req, res) {
	var user = new UserModel();
	user.save(function (err) {
		if (!err) {
			return res.send(user);
		} else {
			return res.send({success: false});
		}
	});
});
app.get('/api/users/:id', function (req, res) {
	UserModel.findById(req.params.id, function (err, user) {
		if (!err) {
			return res.send(user);
		} else {
			return res.send({success: false});
		}
	});
});
app.put('/api/users/:id', function (req, res) {
	UserModel.findById(req.params.id, function (err, user) {
		user.created = req.body.created;
		user.save(function (err) {
			if (!err) {
				return res.send(user);
			} else {
				return res.send({success: false});
			}
		});
	});
});
app.delete('/api/users/:id', function (req, res) {
	UserModel.findById(req.params.id, function (err, user) {
		user.remove(function (err) {
			if (!err) {
				return res.send(user);
			} else {
				return res.send({success: false});
			}
		});
	});
});

// Launch server
app.listen(process.env.VCAP_APP_PORT || 8000);