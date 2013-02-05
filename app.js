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

var Client = new Schema({
	created: { type: Date, default: Date.now }
});
var ClientModel = mongoose.model('Client', Client);
 
var Item = new Schema({
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
var ItemModel = mongoose.model('Item', Item);
 
var Combination = new Schema({
	items: [Item],
	rating: { 
			type: Number, 
			enum: [1, 2, 3, 4, 5],
			required: false
	},
	comment: { type: String },
	created: { type: Date, default: Date.now },
	client: { type: Client }
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
 * Items ---------------------------------------------------------
 */ 
app.get('/api/items', function (req, res) {
	ItemModel
		.find()
		.sort({color:1}).
		exec(function (err, items) {
		if (!err) {
			return res.send(items);
		} else {
			return res.send({success: false});
		}
	});
});
app.post('/api/items', function (req, res) {
	var item;
	
	item = new ItemModel({
		name: req.body.name,
		color: req.body.color
	});

	item.save(function (err) {
		if (!err) {
			return res.send(item);
		} else {
			return res.send({success: false});
		}
	});
});
app.get('/api/items/:id', function (req, res) {
	ItemModel.findById(req.params.id, function (err, item) {
		if (!err) {
			return res.send(item);
		} else {
			return res.send({success: false});
		}
	});
});
app.put('/api/items/:id', function (req, res) {
	ItemModel.findById(req.params.id, function (err, item) {
		console.log(req.body)
		item.name = req.body.name;
		item.color = req.body.color;
		item.save(function (err) {
			if (!err) {
				return res.send(item);
			} else {
				return res.send({success: false});
			}
		});
	});
});
app.delete('/api/items/:id', function (req, res) {
	ItemModel.findById(req.params.id, function (err, item) {
		item.remove(function (err) {
			if (!err) {
				return res.send(item);
			} else {
				return res.send({success: false});
			}
		});
	});
});

/**
 * Clients ---------------------------------------------------------
 */ 
app.get('/api/clients', function (req, res) {
	ClientModel
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
app.post('/api/clients', function (req, res) {
	var client = new ClientModel();
	client.save(function (err) {
		if (!err) {
			return res.send(client);
		} else {
			return res.send({success: false});
		}
	});
});
app.get('/api/clients/:id', function (req, res) {
	ClientModel.findById(req.params.id, function (err, client) {
		if (!err) {
			return res.send(client);
		} else {
			return res.send({success: false});
		}
	});
});
app.put('/api/clients/:id', function (req, res) {
	ClientModel.findById(req.params.id, function (err, client) {
		client.created = req.body.created;
		client.save(function (err) {
			if (!err) {
				return res.send(client);
			} else {
				return res.send({success: false});
			}
		});
	});
});
app.delete('/api/clients/:id', function (req, res) {
	ClientModel.findById(req.params.id, function (err, client) {
		client.remove(function (err) {
			if (!err) {
				return res.send(client);
			} else {
				return res.send({success: false});
			}
		});
	});
});

// Launch server
app.listen(process.env.VCAP_APP_PORT || 8000);