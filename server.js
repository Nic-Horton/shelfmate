const express = require('express');
const { Users, Inventory, sequelize } = require('./models');
const { Op } = require('sequelize');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const SessionStore = require('express-session-sequelize')(session.Store);
const PORT = process.env.PORT || 3000;

const bcrypt = require('bcrypt');
const saltRounds = 10;

const sequelizeSessionStore = new SessionStore({
	db: sequelize,
});

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
	session({
		secret: 'your-secret-key',
		resave: false,
		saveUninitialized: true,
		store: sequelizeSessionStore,
		cookie: { maxAge: 10800000 },
	})
);

const isLoggedIn = (req, res, next) => {
	if (req.session.user) {
		next();
	} else {
		res.redirect('/');
	}
};

const sessionRunning = (req, res, next) => {
	if (req.session.user) {
		res.redirect('/display/dashboard.html');
	} else {
		next();
	}
};

app.get('/', sessionRunning);
app.get('/display/*', isLoggedIn);

app.use(express.static(__dirname + '/public'));

//USERS
//create new user
app.post('/register', async (req, res) => {
	const { firstName, lastName, email, password } = req.body;

	if (!email || !password || !firstName) {
		return res.json({
			error: 'email, password, or first name is must be entered ',
		});
	}

	const emailExists = await Users.findOne({ where: { email } });

	if (emailExists) {
		return res.json({ error: 'email in use' });
	}

	let hashPassword = bcrypt.hashSync(password, saltRounds);

	Users.create({ firstName, lastName, email, password: hashPassword }).then(
		(new_user) => {
			res.json(new_user);
		}
	);
});

// Logs in users
app.post('/login', (req, res) => {
	const { email, password } = req.body;

	Users.findOne({ where: { email } }).then((user) => {
		if (!user) {
			return res.json({ error: 'No user found' });
		}

		console.log(user);

		let comparison = bcrypt.compareSync(password, user.password);
		if (comparison == true) {
			req.session.user = user;
			res.json({ success: true });
		} else {
			res.json({ success: false });
		}
	});
});

//log out users
app.get('/logout', (req, res) => {
	req.session.destroy(() => {
		res.json({ message: 'session destroyed', session: req.session });
	});
});

//change user information
app.put('/users/settings', (req, res) => {
	if (req.session.user) {
		const { firstName, lastName } = req.body;
		const updateFields = {};

		if (firstName) {
			updateFields.firstName = firstName;
		}

		if (lastName) {
			updateFields.lastName = lastName;
		}

		if (Object.keys(updateFields).length === 0) {
			return res.json({ error: 'No fields to update' });
		}

		Users.update(updateFields, {
			where: {
				id: req.session.user.id,
			},
		})
			.then((result) => {
				console.log(result);
				res.json({});
			})
			.catch((error) => {
				console.log(error);
				res.json({ error: 'There was a problem updating your information' });
			});
	} else {
		res.json({ success: false, message: 'please login' });
	}
});

//delete user account
app.delete('/users/delete', (req, res) => {
	if (req.session.user) {
		Users.destroy({ where: { id: req.session.user.id } }).then((results) => {
			console.log(results);
			res.json({ deleted: true });
			req.session.destroy(() => {
				res.json({ message: 'session destroyed', session: req.session });
			});
		});
	} else {
		res.json({ deleted: false });
	}
});

//get user info
app.get('/users/info', (req, res) => {
	if (req.session.user) {
		Users.findOne({
			attributes: ['firstName', 'lastName', 'email'],
			where: { id: req.session.user.id },
		}).then((info) => {
			res.json(info);
		});
	}
});

//INVENTORY

//get all items from specific user
app.get('/inventory', (req, res) => {
	if (req.session.user) {
		Inventory.findAll({
			attributes: ['id', 'item', 'category', 'measurement', 'measurementType'],
			where: { userId: req.session.user.id },
		}).then((items) => {
			console.log(items);
			res.json(items);
		});
	} else {
		res.json({ success: false, message: 'please login' });
	}
});

//add items to a specific user
app.post('/inventory', (req, res) => {
	if (req.session.user) {
		const { item, category, measurement, measurementType } = req.body;
		if (measurement < 0) {
			return res.json({
				error: 'Measurement can not be less than 0',
			});
		}
		Inventory.create({
			userId: req.session.user.id,
			item,
			category,
			measurement,
			measurementType,
		}).then((new_item) => {
			res.json(new_item);
		});
	} else {
		res.json({ success: false, message: 'please login' });
	}
});

//delete an item
app.delete('/inventory/:id', (req, res) => {
	if (req.session.user) {
		const { id } = req.params;
		Inventory.destroy({ where: { id } }).then((results) => {
			console.log(results);
			res.json({});
		});
	} else {
		res.json({ success: false, message: 'please login' });
	}
});

//delete all items for specified user
app.delete('/inventoryAll', (req, res) => {
	if (req.session.user) {
		Inventory.destroy({ where: { userId: req.session.user.id } }).then(
			(results) => {
				console.log(results);
				res.json({});
			}
		);
	} else {
		res.json({ success: false, message: 'please login' });
	}
});

// Update measurement and measurement type for items
app.put('/inventory/:id', (req, res) => {
	if (req.session.user) {
		const { id } = req.params;
		const { measurement, measurementType } = req.body;

		const updateFields = {};

		if (measurement) {
			updateFields.measurement = measurement;
		}

		if (measurementType) {
			updateFields.measurementType = measurementType;
		}

		if (Object.keys(updateFields).length === 0) {
			return res.json({ error: 'No fields to update' });
		}

		if (measurement < 0) {
			return res.json({
				error: 'Measurement can not be less than 0',
			});
		}

		Inventory.update(updateFields, { where: { id } })
			.then((result) => {
				console.log(result);
				res.json({});
			})
			.catch((error) => {
				console.log(error);
				res.json({ error: 'There was a problem updating your information' });
			});
	} else {
		res.json({ success: false, message: 'please login' });
	}
});

//search where id is the logged in users id AND searched string looks through category and item name
app.post('/inventory/search', (req, res) => {
	if (req.session.user) {
		const { search } = req.body;
		console.log(search);

		Inventory.findAll({
			attributes: ['id', 'item', 'category', 'measurement', 'measurementType'],
			where: {
				[Op.and]: [
					{ userId: req.session.user.id },
					{
						[Op.or]: [
							{
								item: {
									[Op.iLike]: '%' + search + '%',
								},
							},
							{
								category: {
									[Op.iLike]: '%' + search + '%',
								},
							},
						],
					},
				],
			},
		}).then((items) => {
			res.json(items);
		});
	} else {
		res.json({ success: false, message: 'please login' });
	}
});

app.listen(PORT, () => {
	console.log('App started in port ' + PORT);
});
