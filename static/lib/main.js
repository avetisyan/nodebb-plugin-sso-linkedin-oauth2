'use strict';

$(window).on('action:script.load', function (ev, data) {
	data.scripts.push('sso-linkedin/login');
});

define('sso-linkedin/login', function () {
	var Login = {};

	Login.init = function () {
		var replaceEl = $('.alt-logins .linkedin a i');
		var replacement = document.createElement('img');
		replacement.src = config.relative_path + '/plugins/nodebb-plugin-sso-linkedin/images/btn_linkedin_signin.png';
		replaceEl.replaceWith(replacement);
	}

	return Login;
})
