var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	flash = require('connect-flash'),
	LocalStrategy = require('passport-local'),
	methodOverride = require('method-override'),
	Article = require('./models/articles'),
	User = require('./models/user'),
	TimeSpent = require('./models/time_spent'),
	Review = require('./models/review');
(path = require('path')), (seedDB = require('./seeds'));

//Connection to DB
//console.log('PathPathPathPath=>', path);
mongoose
	.connect(
		'mongodb+srv://Parth_21:P@rth210497@cluster0-w7rke.mongodb.net/test?retryWrites=true&w=majority',
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true
		}
	)
	.then(() => {
		console.log('Connected to DB');
	})
	.catch(err => {
		console.log('Error', err.message);
	});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(flash());
app.locals.moment = require('moment');
// seedDB();

app.use(
	require('express-session')({
		secret: 'Welcome to my World',
		resave: false,
		saveUninitialized: false
	})
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});
app.use(express.static('views'));

app.get('/admin', function(req,res){
	res.render('admindash');
});


//index route


app.get('/', function (req, res) {
	res.render('index');
});

//articles page route

app.get('/articles', function (req, res) {
	//	console.log(req.user);
	// console.log(req.user['username']);	
	Article.find({})
		.populate('created_by')
		.exec(function (err, allArticles) {
			if (err) {
				console.log(err);
			} else {
				res.render('articles', { articles: allArticles });
			}
		});
});

app.post('/articles', isLoggedIn, function (req, res) {
	var text = req.body.text;
	var name = req.body.name;
	if (req.user) var user_id = req.user._id
	// var user_id = '5e73d27f2d18e00536ffc3a6';
	var article_id =
		Math.random()
			.toString(36)
			.substring(2, 15) +
		Math.random()
			.toString(36)
			.substring(2, 15);
	var newArticle = { article: { id: article_id, name: name, text: text }, created_by: user_id };
	console.log('newArticlenewArticlenewArticle',newArticle)
	Article.create(newArticle, function (err, newlyCreated) {
		if (err) {
			console.log(err);
		} else {
			res.redirect('/articles');
		}
	});
});

app.post('/timespent', isLoggedIn, function (req, res) {
	console.log(req.body);
	var time = req.body.time;
	var article_id = req.body.article_id;
	if (req.user) var user_id = req.user._id
	//	var user_id = '5e73d27f2d18e00536ffc3a6';
	var newTimeSpent = {
		time: time,
		article_id: article_id,
		user_id: user_id,
		created_on: new Date()
	};
	TimeSpent.create(newTimeSpent, function (err, newlyCreated) {
		if (err) {
			console.log(err);
		} else {
			console.log('newlyCreatednewlyCreatednewlyCreated', newlyCreated);
			res.redirect('/articles');
		}
	});
});


app.get('/timespent/:id/:time', function (req, res) {
	console.log(req.body);
	var time = req.params.time;
	var article_id = req.params.id;
	if (req.user) var user_id = req.user._id
	//	var user_id = '5e49cb1cf25391113e7c9d77';
	var newTimeSpent = {
		time: time,
		article_id: article_id,
		user_id: user_id,
		created_on: new Date()
	};
	TimeSpent.create(newTimeSpent, function (err, newlyCreated) {
		if (err) {
			console.log(err);
		} else {
			console.log('newlyCreatednewlyCreatednewlyCreated', newlyCreated);
			res.redirect('/articles');
		}
	});
});

//new articles route

app.get('/articles/new', isLoggedIn, function (req, res) {
	res.render('new');
});

//User Signup route

app.get('/register', function (req, res) {
	res.render('register');
});

app.post('/register', function (req, res) {
	var newUser = new User(
		{ 
			username: req.body.username,
			firstName:req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			avatar: req.body.avatar
		 });
	if (req.body.adminCode === '21') {
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function (err, user) {
		if (err) {
			console.log(err);
			return res.render('register');
		}

		passport.authenticate('local')(req, res, function () {
			res.redirect('/articles');
		});
	});
});

//User login route

app.get('/login', function (req, res) {
	//req.flash("error", "Please Login First!!");
	res.render('login');
});

app.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/articles',
		failureRedirect: '/login'
	}),
	function (req, res) { }
);

// Reviews Index
app.get("/articles/:id/reviews/", function (req, res) {
	Article.findById(req.params.id).populate({
		path: "reviews",
		options: { sort: { createdAt: -1 } } // sorting the populated reviews array to show the latest first
	}).exec(function (err, article) {
		if (err || !article) {
			 req.flash("error", err.message);
			return res.redirect("back");
		}
		res.render("review_index", { article: article });
	});
});

// Reviews New
app.get("/articles/:id/reviews/new", isLoggedIn, checkReviewExistence, function (req, res) {


	// middleware.checkReviewExistence checks if a user already reviewed the campground, only one review per user is allowed
	Article.findById(req.params.id, function (err, article) {
		if (err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		res.render("review_new", { article: article });

	});
});

// Reviews Create
app.post("/articles/:id/reviews/", isLoggedIn, checkReviewExistence, function (req, res) {
	//lookup campground using ID
	Article.findById(req.params.id).populate("reviews").exec(function (err, article) {
		console.log('articlearticlearticlearticle',article);
		if (err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		Review.create(req.body.review, function (err, review) {
			console.log('reviewreviewreview',review)
			if (err) {
				  req.flash("error", err.message);
				return res.redirect("back");
			}
			//add author username/id and associated campground to the review
			review.author.id = req.user._id;
			review.author.username = req.user.username;
			review.article = article;
			//save review
			review.save();
			article.reviews.push(review);
			// calculate the new average review for the campground
			article.rating = calculateAverage(article.reviews);
			//save campground
			article.save();
			 req.flash("success", "Your review has been successfully added.");
			res.redirect('/articles/' + article._id);
		});
	});
});

function calculateAverage(reviews) {
	if (reviews.length === 0) {
		return 0;
	}
	var sum = 0;
	reviews.forEach(function (element) {
		sum += element.rating;
	});
	return sum / reviews.length;
}

// Reviews Edit
app.get("/articles/:id/reviews/:review_id/edit", checkReviewOwnership, function (req, res) {
	console.log('slrfjndsjfnjhhbj')
	if (req.review) var review_id = req.review._id;
	Review.findOne({ _id: req.params.id }, function (err, foundReview) {
		if (err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		res.render("review_edit", { article_id: _id, review: foundReview });
	});
});

// Reviews Update
app.put("/articles/:id/reviews/:review_id", checkReviewOwnership, function (req, res) {
	newrating = req.body.rating;
	newtext = req.body.text;
	Review.findByIdAndUpdate({ _id: req.params.id }, {
		article: { text: newtext, rating: newrating }
	}, function (err, updatedReview) {
		if (err) {
			 req.flash("error", err.message);
			return res.redirect("back");
		}
		Article.findById(req.params.id).populate("reviews").exec(function (err, article) {
			if (err) {
				  req.flash("error", err.message);
				return res.redirect("back");
			}
			// recalculate campground average
			article.rating = calculateAverage(article.reviews);
			//save changes
			article.save();
			req.flash("success", "Your review was successfully edited.");
			res.redirect('/articles/' + article._id);
		});
	});
});

// Reviews Delete
app.delete("/articles/:id/reviews/:review_id", checkReviewOwnership, function (req, res) {
	Review.findByIdAndRemove(req.params.review_id, function (err) {
		if (err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		Article.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.review_id } }, { new: true }).populate("reviews").exec(function (err, article) {
			if (err) {
				  req.flash("error", err.message);
				return res.redirect("back");
			}
			// recalculate article average
			article.rating = calculateAverage(article.reviews);
			//save changes
			article.save();
			req.flash("success", "Your review was deleted successfully.");
			res.redirect("/articles/" + req.params.id);
		});
	});
});


//myarticle

app.get('/articles/myarticles', isLoggedIn, function (req, res) {
	//console.log(req.user);
	// console.log(req.user['username']);	
	Article.find({})
		.populate('created_by')
		.exec(function (err, allArticles) {
			if (err) {
				console.log(err);
			} else {
				res.render('myarticles', { articles: allArticles });
			}
		});
});
//Article edit route

app.get('/articles/:id/edit', function (req, res) {
	if (req.user) var user_id = req.user._id;
	if (req.isAuthenticated()) {
		Article.findOne({ _id: req.params.id }, function (err, foundArticle) {
			if (err) {
				res.redirect('/articles');
			} else {
				if (JSON.stringify(user_id) == JSON.stringify(foundArticle.created_by)) {
					res.render('article_edit', { article: foundArticle });
				} else {
					res.send('Dont have permission to edit!!');
				}
			}
		});
	} else {
		res.send('You need to be logged in to do that');
	}
});

app.put('/articles/:id', isLoggedIn, function (req, res) {
	newtext = req.body.updated_text;
	newtitle = req.body.updated_title;
	Article.findByIdAndUpdate({ _id: req.params.id }, { article: { text: newtext, name: newtitle } }, function (
		err,
		updatedArticle
	) {
		if (err) {
			res.redirect('/articles');
		} else {
			res.redirect('/articles/' + req.params.id);
		}
	});
});

//Delete route

app.delete('/articles/:id', checkArticleOwnership, function (req, res) {
	// newtext = req.params.text;
	// newtitle = req.body.name;
	Article.findByIdAndRemove(req.params.id, function (err, resp) {
		if (err) {
			res.redirect('/articles');
		} else {
			Review.remove({ _id: { $in: resp.reviews } }, function (err) {

				if (err) {
					console.log(err);
					return res.redirect("/articles");
				}
				// Article.remove();
				req.flash("success", "Article Deleted Successfully!!");

				res.redirect('/articles');
			});

		}
	});
});

//logout route

app.get('/logout', function (req, res) {
	req.logout();
	req.flash("success", "Logged you out!!");
	res.redirect('/articles');
});

//Profile Page


app.get("/articles/users/:id", function(req,res){
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			req.flash("error","Something went wrong.");
			res.redirect("/");
		}
		Article.find().where('created_by.id').equals('foundUser._id').exec(function(err,articles){
			if(err){
				req.flash("error", "You dont have authority");
				res.redirect("/")
			}else{
				res.render("user_show", {user:foundUser, articles: articles});
			}
		});
		
	});
});

// More Info Page

app.get('/articles/:id', function (req, res) {
	Article.findOne({ _id: req.params.id }).populate({
		path: "reviews",
		options: { sort: { createdAt: -1 } }
	}).exec(function (err, foundArticle) {
		if (err) {
			res.redirect('/articles');
		} else {
			res.render('show', { article: foundArticle });
		}
	});
});

//middleware

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "Please Login First!");
	res.redirect('/login');
}
function checkArticleOwnership(req, res, next) {
	if (req.user) var user_id = req.user._id;
	if (req.isAuthenticated()) {
		Article.findOne({ _id: req.params.id }, function (err, foundArticle) {
			if (err) {
				res.redirect("back");
			} else {
				//var user_id= req.params.id;
				if (JSON.stringify(user_id) == JSON.stringify(foundArticle.created_by)) {
					next();
				} else {
					res.redirect("back");
				}
			}
		});
	}
	else {
		res.redirect("back");
	}

}
//Review Middleware

function checkReviewOwnership(req, res, next) {
	console.log("dgjfgjbfj: ",req.params.review_id)
	console.log("sdkjbdjbfdj", req.user._id)
	if (req.isAuthenticated()) {
		Review.findById(req.params.review_id, function (err, foundReview) {
			console.log('foundReviewfoundReview',foundReview)
			if (err || !foundReview) {
				res.redirect("back");
			} else {
				// does user own the comment?
				if (JSON.stringify(foundReview.author.id) == JSON.stringify(req.user._id)) {
					next();
				} else {
					req.flash('error', "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash('error', 'You need to be logged in to do that');
		res.redirect("back");
	}
};

function checkReviewExistence(req, res, next) {
	if (req.isAuthenticated()) {
		Article.findById(req.params.id)
			.populate('reviews')
			.exec(function (err, foundArticle) {
				if (err || !foundArticle) {
					req.flash('error', 'Article not found.');
					res.redirect('back');
				} else {
					// check if req.user._id exists in foundArticle.reviews
					var foundUserReview = foundArticle.reviews.some(function (review) {
						return review.author.id == req.user._id;
					});
					if (foundUserReview) {
							req.flash('error', 'You already wrote a review.');
						return res.redirect('/articles/' + foundArticle._id);
					}
					// if the review was not found, go to the next middleware
					next();
				}
			});
	} else {
		req.flash('error', 'You need to login first.');
		res.redirect('back');
	}
};

// Promise.reject(new Error(err));

app.listen(3000, function () {
	console.log('Omnibus server has started');
});