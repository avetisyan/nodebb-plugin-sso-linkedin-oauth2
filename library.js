(function(module) {
	"use strict";

	var User = require.main.require('./src/user'),
		meta = require.main.require('./src/meta'),
		db = require.main.require('./src/database'),
		passport = require.main.require('passport'),
		passportLinkedIn = require.main.require('passport-linkedin-oauth2-special').Strategy,
		nconf = require.main.require('nconf'),
		async = require.main.require('async'),
		winston = require.main.require('winston');

	var authenticationController = require.main.require('./src/controllers/authentication');

	var constants = Object.freeze({
		'name': "LinkedIn",
		'admin': {
			'route': '/plugins/sso-linkedin-v2',
			'icon': 'fa-linkedin-square'
		}
	});

	var LinkedIn = {
		settings: undefined,
	};

	LinkedIn.init = function(data, callback) {
		var hostHelpers = require.main.require('./src/routes/helpers');

		function render(req, res, next) {
			res.render('admin/plugins/sso-linkedin-v2', {
				baseUrl: nconf.get('url'),
			});
		}

		data.router.get('/admin/plugins/sso-linkedin-v2', data.middleware.admin.buildHeader, render);
		data.router.get('/api/admin/plugins/sso-linkedin-v2', render);

		hostHelpers.setupPageRoute(data.router, '/deauth/linkedin', data.middleware, [data.middleware.requireUser], function (req, res) {
			res.render('plugins/sso-linkedin-v2/deauth', {
				service: "LinkedIn",
			});
		});
		data.router.post('/deauth/linkedin', [data.middleware.requireUser, data.middleware.applyCSRF], function (req, res, next) {
			LinkedIn.deleteUserData({
				uid: req.user.uid,
			}, function (err) {
				if (err) {
					return next(err);
				}

				res.redirect(nconf.get('relative_path') + '/me/edit');
			});
		});

		meta.settings.get('sso-linkedin-v2', function (err, settings) {
			LinkedIn.settings = settings;
			callback();
		});
	}

	LinkedIn.exposeSettings = function (data, callback) {
		data['sso-linkedin-v2'] = {

		};

		callback(null, data);
	};

	LinkedIn.getStrategy = function(strategies, callback) {
		if (LinkedIn.settings['id'] && LinkedIn.settings['secret']) {
			passport.use(new passportLinkedIn({
				clientID: LinkedIn.settings['id'],
				clientSecret: LinkedIn.settings['secret'],
				callbackURL: nconf.get('url') + '/auth/linkedin/callback',
				scope: ['r_liteprofile', 'r_emailaddress'],
				state: true,
				passReqToCallback: true
			}, function(req, accessToken, refreshToken, profile, done) {
				if (req.hasOwnProperty('user') && req.user.hasOwnProperty('uid') && req.user.uid > 0) {
					// Save LinkedIn-specific information to the user
					User.setUserField(req.user.uid, 'linkedInId', profile.id);
					db.setObjectField('linkedInId:uid', profile.id, req.user.uid);
					return done(null, req.user);
				}

				LinkedIn.login(profile.id, profile.displayName, profile._json.emailAddress, profile._json.pictureUrl, (profile._json.location ? profile._json.location.name : null), profile._json.publicProfileUrl, function(err, user) {
					if (err) {
						return done(err);
					}

					authenticationController.onSuccessfulLogin(req, user.uid, function (err) {
						done(err, !err ? user : null);
					});
				});
			}));

			strategies.push({
				name: 'linkedin',
				url: '/auth/linkedin',
				callbackURL: '/auth/linkedin/callback',
				icon: 'fa-linkedin-square',
				scope: ['r_liteprofile', 'r_emailaddress']
			});
		}

		callback(null, strategies);
	};

	LinkedIn.appendUserHashWhitelist = function (data, callback) {
		data.whitelist.push('linkedInId');
		return setImmediate(callback, null, data);
	};

	LinkedIn.getAssociation = function (data, callback) {
		User.getUserField(data.uid, 'linkedInId', function (err, linkedInId) {
			if (err) {
				return callback(err, data);
			}

			if (linkedInId) {
				data.associations.push({
					associated: true,
					url: 'https://linkedin.com/in/' + linkedInId,
					deauthUrl: nconf.get('url') + '/deauth/linkedin',
					name: constants.name,
					icon: constants.admin.icon
				});
			} else {
				data.associations.push({
					associated: false,
					url: nconf.get('url') + '/auth/linkedin',
					name: constants.name,
					icon: constants.admin.icon
				});
			}

			callback(null, data);
		})
	};

	LinkedIn.login = function(linkedInId, handle, email, picture, location, website, callback) {
		LinkedIn.getUidByLinkedInId(linkedInId, function(err, uid) {
			if(err) {
				return callback(err);
			}

			if (uid !== null) {
				// Existing User
				callback(null, {
					uid: uid
				});
			} else {
				// New User
				var success = function(uid, merge) {
					// Save linkedin-specific information to the user
					var data = {
						linkedInId: linkedInId,
						fullname: handle
					};

					if (!merge) {
						if (picture && 0 < picture.length) {
							data.uploadedpicture = picture;
							data.picture = picture;
						}

						if (location && 0 < location.length) {
							data.location = location;
						}

						if (website && 0 < website.length) {
							data.website = website;
						}
					}

					async.parallel([
						function(callback2) {
							db.setObjectField('linkedInId:uid', linkedInId, uid, callback2);
						},
						function(callback2) {
							User.setUserFields(uid, data, callback2);
						}
					], function(err, results) {
						if (err) {
							return callback(err);
						}

						callback(null, {
							uid: uid
						});
					});
				};

				User.getUidByEmail(email, function(err, uid) {
					if(err) {
						return callback(err);
					}

					if (!uid) {
						User.create({username: handle, email: email}, function(err, uid) {
							if(err) {
								return callback(err);
							}

							success(uid, false);
						});
					} else {
						success(uid, true); // Existing account -- merge
					}
				});
			}
		});
	};

	LinkedIn.getUidByLinkedInId = function(linkedInId, callback) {
		db.getObjectField('linkedInId:uid', linkedInId, function(err, uid) {
			if (err) {
				return callback(err);
			}
			callback(null, uid);
		});
	};

	LinkedIn.addMenuItem = function(custom_header, callback) {
		custom_header.authentication.push({
			"route": constants.admin.route,
			"icon": constants.admin.icon,
			"name": constants.name
		});

		callback(null, custom_header);
	};

	LinkedIn.deleteUserData = function(data, callback) {
		var uid = data.uid;

		async.waterfall([
			async.apply(User.getUserField, uid, 'linkedInId'),
			function(oAuthIdToDelete, next) {
				db.deleteObjectField('linkedInId:uid', oAuthIdToDelete, next);
			},

			function (next) {
				db.deleteObjectField('user:' + uid, 'linkedInId', next);
			},
		], function(err) {
			if (err) {
				winston.error('[sso-linkedin-v2] Could not remove OAuthId data for uid ' + uid + '. Error: ' + err);
				return callback(err);
			}
			callback(null, uid);
		});
	};

	module.exports = LinkedIn;
}(module));
