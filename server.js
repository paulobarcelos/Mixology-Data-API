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


// Schemas
var Schema = mongoose.Schema;

var User = new Schema({
	browser : {
		type: String
	},
	created: { 
		type: Date,
		default: Date.now
	}
});
var UserModel = mongoose.model('User', User);
 
var Flavor = new Schema({
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
var FlavorModel = mongoose.model('Flavor', Flavor);
 
var Combination = new Schema({
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
 * Flavors ---------------------------------------------------------
 */ 
app.get('/api/flavors', function (req, res) {
	FlavorModel
		.find()
		.sort({created:1})
		.exec(function (err, flavors) {
		if (!err) {
			return res.send(flavors);
		} else {
			return res.send({success: false});
		}
	});
});
app.post('/api/flavors', function (req, res) {
	var groups = req.body.groups.split(',');
	
	flavor = new FlavorModel({
		name: req.body.name,
		color: req.body.color,
		groups: req.body.groups.split(',')
	});

	flavor.save(function (err) {
		if (!err) {
			return res.send(flavor);
		} else {
			return res.send({success: false});
		}
	});
});
app.get('/api/flavors/:id', function (req, res) {
	FlavorModel.findById(req.params.id, function (err, flavor) {
		if (!err) {
			return res.send(flavor);
		} else {
			return res.send({success: false});
		}
	});
});
app.put('/api/flavors/:id', function (req, res) {
	FlavorModel.findById(req.params.id, function (err, flavor) {
		flavor.name = req.body.name;
		flavor.color = req.body.color;
		flavor.groups =  req.body.groups.split(',');
		flavor.save(function (err) {
			if (!err) {
				return res.send(flavor);
			} else {
				return res.send({success: false});
			}
		});
	});
});
app.delete('/api/flavors/:id', function (req, res) {
	FlavorModel.findById(req.params.id, function (err, flavor) {
		flavor.remove(function (err) {
			if (!err) {
				return res.send(flavor);
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
		.sort({created:1})
		.exec(function (err, result) {
		if (!err) {
			return res.send(result);
		} else {
			return res.send({success: false});
		}
	});
});
app.post('/api/users', function (req, res) {
	var user = new UserModel();
	console.log(req)
	user.browser = req.body.browser;

	
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
		user.browser = req.body.browser;
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

/**
 * Combinations ---------------------------------------------------------
 */ 
app.get('/api/combinations', function (req, res) {
	CombinationModel
		.find()
		.sort({created:1})
		.exec(function (err, result) {
		if (!err) {
			return res.send(result);
		} else {
			return res.send({success: false});
		}
	});
});
app.post('/api/combinations', function (req, res) {
	var combination = new CombinationModel();
	
	combination.rating = req.body.rating;
	combination.comment = req.body.comment;
	combination.userId = req.body.userId;
	combination.flavorIds = req.body.flavorIds;

	combination.save(function (err) {
		if (!err) {
			return res.send(combination);
		} else {
			return res.send({success: false});
		}
	});
});
app.get('/api/combinations/:id', function (req, res) {
	CombinationModel.findById(req.params.id, function (err, combination) {
		if (!err) {
			return res.send(combination);
		} else {
			return res.send({success: false});
		}
	});
});
app.put('/api/combinations/:id', function (req, res) {
	CombinationModel.findById(req.params.id, function (err, combination) {
		combination.rating = req.body.rating;
		combination.comment = req.body.comment;
		combination.userId = req.body.userId;
		combination.flavorIds = req.body.flavorIds;

		combination.save(function (err) {
			if (!err) {
				return res.send(combination);
			} else {
				return res.send({success: false});
			}
		});
	});
});
app.delete('/api/combinations/:id', function (req, res) {
	CombinationModel.findById(req.params.id, function (err, combination) {
		combination.remove(function (err) {
			if (!err) {
				return res.send(combination);
			} else {
				return res.send({success: false});
			}
		});
	});
});

// Launch server
app.listen(process.env.VCAP_APP_PORT || process.env.PORT || 8080);