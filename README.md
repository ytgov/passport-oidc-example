# Passport OIDC Example

This is a simple Node.js/ExpressJS app to demonstrate OIDC federation with CitizenOne™ or any other OIDC provider. It uses [Passport](http://www.passportjs.org) for handling authentication and sessions. Specifically, it uses the [passport-openidconnect](http://www.passportjs.org/packages/passport-openidconnect/) authentication strategy. 

## Running the app

### Install the dependencies

```
npm install
```

### Configuration 
You will need to configure the application to talk to your instance of CitizenOne™. The only changes that should be required are in [app.js](https://github.com/Vivvo/passport-oidc-example/blob/master/app.js#L35). Update the following snippet of code with your issuer, authorization URL, token URL, user info URL, client id and client secret. The callback URL and scopes should not need to be updated.
```
  passport.use('oidc', new OidcStrategy({
    issuer: 'https://c1dev.vivvo.com/',
    authorizationURL: 'https://c1dev.vivvo.com/oauth/v2/authorize',
    tokenURL: 'https://c1dev.vivvo.com/oauth/v2/token',
    userInfoURL: 'https://c1dev.vivvo.com/oauth/v2/userinfo',
    clientID: '41209adf-45e9-4d1b-8720-8c6a1e680ceb',
    clientSecret: 'd18a3ba5-e7be-4da6-857d-333e5cf6e794',
    callbackURL: 'http://localhost:3000/authorization-code/callback',
    scope: 'openid profile email phone address'
  }, (issuer, sub, profile, accessToken, refreshToken, done) => {
    return done(null, profile)
  }))
```

### Starting the app
```
npm start
```

In your favourite browser, head to http://localhost:3000 and hit the login button to start the login flow. Once you are logged in, you will see a page with the profile information returned from CitizenOne™. 
