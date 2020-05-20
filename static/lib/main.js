'use strict';

$(window).on('action:script.load', function (ev, data) {
	data.scripts.push('sso-linkedin-v2/login');
});

define('sso-linkedin-v2/login', function () {
	var Login = {};

	Login.init = function () {
		var replaceEl = $('.alt-logins .linkedin a i');
		var replacement = document.createElement('img');
		replacement.src = config.relative_path + '/plugins/nodebb-plugin-sso-linkedin-v2/images/btn_linkedin_signin.png';
		replaceEl.replaceWith(replacement);
	}

	return Login;
})
