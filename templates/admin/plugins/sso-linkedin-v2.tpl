<div class="row">
	<div class="col-sm-2 col-xs-12 settings-header">LinkedIn SSO</div>
	<div class="col-sm-10 col-xs-12">
		<div class="alert alert-info">
			<strong>Quick Start</strong>
			<ol>

				<li>
					From the "Credentials" page, create a new "OAuth Client ID".
					<ul>
						<li>The "Application Type" is "Web application"</li>
						<li>"Name" can be anything. Perhaps "NodeBB SSO" will suffice.</li>
						<li>"Authorized Javascript origins" can be left empty</li>
						<li>
							The "Authorised Redirect URI" is your NodeBB's URL with `/auth/linkedin/callback` appended to it.
							<ul>
								<li>Our best guess for this site is <code>{baseUrl}/auth/linkedin/callback</code></li>
								<li>When you enter this value into the text field, be sure to hit <code>Enter</code> to submit the URL before saving</li>
							</ul>
						</li>
					</ul>
				</li>
				<li>You will be shown a screen containing your <strong>Client ID</strong> and <strong>Client Secret</strong>. Paste those two values below.</li>
				<li>Save and restart NodeBB via the ACP Dashboard</li>
			</ol>
		</div>
		<form role="form" class="sso-linkedin-v2-settings">
			<div class="form-group">
				<label for="id">Client ID</label>
				<input id="id" type="text" name="id" title="Client ID" class="form-control input-lg" placeholder="Client ID">
			</div>
			<div class="form-group">
				<label for="secret">Secret</label>
				<input id="secret" type="text" name="secret" title="Client Secret" class="form-control" placeholder="Client Secret">
			</div>
			<div class="checkbox">
				<label for="autoconfirm" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
					<input type="checkbox" class="mdl-switch__input" id="autoconfirm" name="autoconfirm">
					<span class="mdl-switch__label">Skip email verification for people who register using SSO?</span>
				</label>
			</div>
			<div class="checkbox">
				<label for="disableRegistration" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
					<input type="checkbox" class="mdl-switch__input" id="disableRegistration" name="disableRegistration" />
					<span class="mdl-switch__label">Disable user registration via SSO</span>
				</label>
			</div>
			<p class="help-block">
				Restricting registration means that only registered users can associate their account with this SSO strategy.
				This restriction is useful if you have users bypassing registration controls by using social media accounts, or
				if you wish to use the NodeBB registration queue.
			</p>
		</form>
	</div>
</div>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>
