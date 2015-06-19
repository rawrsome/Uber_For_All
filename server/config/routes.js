module.exports = function (app, https, passport, uberStrategy, clientID, clientSecret, ServerID, sessionSecret){

// _______________ BEGIN PASSPORT STUFF ________________
// Serialize and deserialize users used by passport
	passport.serializeUser(function (user, done){
		done(null, user);
	});
	passport.deserializeUser(function (user, done){
		done(null, user);
	});

// define what strategy passport will use -- this comes from passport-uber
	passport.use(new uberStrategy({
			clientID: clientID,
			clientSecret: clientSecret,
			callbackURL: "http://localhost:8000/auth/uber/callback"
		},
		function (accessToken, refreshToken, user, done) {
	    // THIS IS WHERE YOU WOULD PUT SOME DB LOGIC TO SAVE THE USER
			user.accessToken = accessToken;
			return done(null, user);
		}
	));

// FUNCTIONS
	// use this for an api get request without oauth
	function getRequest(endpoint, callback) {
	  var options = {
	    hostname: "sandbox-api.uber.com",
	    path: endpoint,
	    method: "GET",
	    headers: {
	      Authorization: "Token " + ServerID
	    }
	  }
	  var req = https.request(options, function(res) {
	    res.on('data', function(data) {
	      console.log('data from unauthorized request:');
	      console.log(JSON.parse(data));
	      callback(null, JSON.parse(data));
	    })
	  })
	  req.end();
	  req.on('error', function(err) {
	    callback(err, null);
	  });
	}

	// route middleware to make sure the request is from an authenticated user
	function ensureAuthenticated (request, response, next) {
	  console.log('inside ensure Authenticated');
		if (request.isAuthenticated()) {
			return next();
		}
		response.redirect('/login');
	}
	// use this for an api get request
	function getAuthorizedRequest(endpoint, accessToken, callback) {
	  var options = {
	    hostname: "sandbox-api.uber.com",
	    path: endpoint,
	    method: "GET",
	    headers: {
	      Authorization: "Bearer " + accessToken
	    }
	  }
	  var req = https.request(options, function(res) {
	    res.on('data', function(data) {
	      callback(null, JSON.parse(data));
	    })
	  })
	  req.end();
	  req.on('error', function(err) {
	    callback(err, null);
	  });
	}
	// use this for an api post request
	function postAuthorizedRequest(endpoint, accessToken, parameters, callback) {
	  var options = {
	    hostname: "sandbox-api.uber.com",
	    path: endpoint,
	    method: "POST",
	    headers: {
	      "Content-Type": "application/json",
	      Authorization: "Bearer " + accessToken
	    }
	  }
	  console.log('Requesting a ride from the sandbox with the query: ');
	  console.log(endpoint);
	  var req = https.request(options, function (res) {
	    res.on('data', function(data) {      
	      console.log('data from post request:');
	      console.log(JSON.parse(data));
	      callback(null, JSON.parse(data));
	    })
	  })
	  req.write(JSON.stringify(parameters));
	  req.end();
	  req.on('error', function(err) {
	    callback(err, null);
	  });
	}



// LOCAL
	// login page 
		app.get('/login', function (request, response) {
			response.render('login');
		});
	// logout
		app.get('/logout', function (request, response) {
			request.logout();
			response.redirect('/login');
		});

// UBER
	// GET
		// get request to start the whole oauth process with passport
		app.get('/auth/uber',
			passport.authenticate('uber',
				{ scope: ['profile', 'history', 'history_lite', 'request', 'request_receipt'] }
			)
		);

		// authentication callback redirects to /login if authentication failed or home if successful
		app.get('/auth/uber/callback',
			passport.authenticate('uber', {
				failureRedirect: '/login'
			}), function(req, res) {
		    res.redirect('/');
		});

		// home after the user is authenticated
		app.get('/', ensureAuthenticated, function (request, response) {
			response.render('index');
		});


	// ENDPOINTS

		// GET
			// /profile API endpoint
			app.get('/profile', ensureAuthenticated, function (request, response) {
				getAuthorizedRequest('/v1/me', request.user.accessToken, function (error, res) {
					if (error) { console.log(error); }
					response.json(res);
				});
			});

			// history API endpoint
			app.get('/history', ensureAuthenticated, function (request, response) {
				getAuthorizedRequest('/v1.2/history', request.user.accessToken, function (error, res) {
					if (error) { console.log("err", error); }
					response.json(res);
				});
			});



		// POST

			// --=== RIDE REQUEST API endpoint ===-- //
			app.post('/requestUberBlack', ensureAuthenticated, function (request, response) {
				// NOTE! Keep in mind that, although this link is a GET request, the actual ride request must be a POST, as shown below
			  console.log("This is the user request:");
			  console.log(request.user);
				var parameters = {
					product_id: "a1111c8c-c720-46c3-8534-2fcdd730040d",
					start_latitude: 37.37730, //request.body.start_latitude,
					start_longitude: -121.91257, //request.body.start_longitude,
					end_latitude: 37.10001, //request.body.end_latitude,
					end_longitude: -121.0101 //request.body.end_longitude,					
				};  

			  postAuthorizedRequest('/v1/requests?'+parameters.product_id+'&start_latitude='+parameters.start_latitude+'&start_longitude='+parameters.start_longitude+'&end_latitude='+parameters.end_latitude+'&end_longitude='+parameters.end_longitude, request.user.accessToken, parameters, function (error, res, pars) {
			    if (error) { console.log(error); }    
			    console.log("SEARCHING FOR DRIVER...");
			    console.log(res);    
			    // console.log("FULL RESPONSE");
			    console.log(pars);
			    // response.json(res);
			    response.render("response", {info: res, params: pars});
			  });
			});


			// product estimate request
			app.post('/priceestimate', ensureAuthenticated, function (request, response) {
			  // NOTE! Keep in mind that, although this link is a GET request, the actual ride request must be a POST, as shown below
			  console.log('user uuid: ' + request.user.uuid)
			  console.log('user accessToken: ' + request.user.accessToken)

			  // console.log('here is the reqbody');
			  // console.log(request.body);

			  var parameters = {
			    start_latitude: 37.37729,
			    start_longitude: -121.91268,
			    end_latitude: 37.3,
			    end_longitude: -121.8,
			  };  

			  // var parameters = {
			  //   start_latitude : request.body.start_latitude,
			  //   start_longitude: request.body.start_longitude,
			  //   end_latitude: request.body.end_latitude,
			  //   end_longitude: request.body.end_longitude,
			  // };  

			  postAuthorizedRequest("/v1/esimtates/price", request.user.accessToken, parameters, function (error, res) {

			  	console.log('=================== post request /v1/requests/=====================');

			    var request_id = res.request_id;
			   	console.log('here is the request id:');
			    console.log(request_id);

				console.log('========================================');


			    getAuthorizedRequest('/v1/requests/' + request_id + '/map', request.user.accessToken, function (req, res) {
			      console.log('=================== get request /v1/requests/=====================');
			      console.log(res);
			      console.log('========================================');
			    });

			    response.json(res);
			  });

			  // postAuthorizedRequestPriceEstimate('/v1/esimtates/price?start_latitude='+parameters.start_latitude+'&start_longitude='+
			  //   parameters.start_longitude+'&end_latitude='+parameters.end_latitude+'&end_longitude='+
			  //   parameters.end_longitude + '', request.user.accessToken, parameters, function (error, res, pars) {
			  //   if (error) { console.log(error); }    
			  //     console.log(res);    
			  //     console.log(pars);
			  //     response.render("response", {info: res, params: pars});
			  // });
			});



			app.post('/reqAccepted/:id', ensureAuthenticated, function (request, response) {
			  console.log("My access token: ");
			  console.log(request.user.accessToken);
			  parameters = {
			    "status": "accepted"
			  }
			  var url_id = request.url.split("/").pop();
			  postAuthorizedRequest('/v1/sandbox/requests/'+url_id+'?access_token='+request.user.accessToken, request.user.accessToken, parameters, function (error, res) {
			    console.log("Requested response: ");
			    console.log(res);
			  })
			})

			app.get("/getUpdate/:id", ensureAuthenticated, function (request, response) {
			  var url_id = request.url.split("/").pop();
			  console.log(url_id)
			  getAuthorizedRequest('/v1/requests/'+url_id, request.user.accessToken, function (error, res) {
			    // console.log('RES BODY HERE: ');
			    console.log(res);
			    res.render("response", {info: res});
			  });
			});




	// app.post('/requestDriver/:id', ensureAuthenticated, function (request, response) {
	//   postAuthorizedRequest('/v1/sandbox/requests/')
	// })


			// get updated status from API endpoint
			app.get('/track/:id', ensureAuthenticated, function (request, response) {
			  // console.log("Get request from /track:");
			  // console.log(request.body);
			  // var url_id = request.url.split("/").pop();
			  // console.log("request id from URL: ");
			  // console.log(url_id);
			  // console.log(request.body);
			  // console.log("http header: ");
			  // console.log(response);
			  // var resData;

			  getAuthorizedRequest('/v1/requests/'+url_id, request.user.accessToken, function (error, res) {

			    // if(url) {
			    //   var id_url = url;
			    //   console.log(id_url);
			    // }
			    // console.log("Access TokeN:");
			    // console.log(request.user.accessToken);
			    if (error) { console.log(error); }
			    console.log("--=== Tracking Uber Car: ===--");
			    console.log(res)
			    // response.json(res);
			    // resData = res;
			    // console.log(resData)''
			    response.render("response", {info: res});
			  });
			      // console.log(res);

			});


// END OF MODULE.EXPORTS
}


// 	// post to show unauthorized request
// app.post('/cars', function(request, response) {
//   getRequest('/v1/products?latitude='+request.body.start_latitude+'&longitude='+request.body.start_longitude, function(err, res) {
//     response.json(res);
//   });
// });