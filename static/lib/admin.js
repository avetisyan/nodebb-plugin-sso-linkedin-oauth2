'use strict';
/* globals $, app, socket, require */

define('admin/plugins/sso-linkedin', ['settings'], function(Settings) {

	var ACP = {};

	ACP.init = function() {
		Settings.load('sso-linkedin', $('.sso-linkedin-settings'));

		$('#save').on('click', function() {
			Settings.save('sso-linkedin', $('.sso-linkedin-settings'), function() {
				app.alert({
					type: 'success',
					alert_id: 'sso-linkedin-saved',
					title: 'Settings Saved',
					message: 'Please rebuild and restart your NodeBB to apply these settings, or click on this alert to do so.',
					clickfn: function() {
						socket.emit('admin.reload');
					}
				});
			});
		});


	};

	return ACP;
});
