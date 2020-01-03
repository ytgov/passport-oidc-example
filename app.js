var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var session = require('express-session')
var passport = require('passport')
var OidcStrategy = require('passport-openidconnect').Strategy

var indexRouter = require('./routes')
var usersRouter = require('./routes/users')

var vivvo= {
    issuer: 'https://yukon.vivvocloud.com/',
    authorizationURL: 'https://yukon.vivvocloud.com/oauth/v2/authorize',
    tokenURL: 'https://yukon.vivvocloud.com/oauth/v2/token',
    userInfoURL: 'https://yukon.vivvocloud.com/oauth/v2/userinfo',
    clientID: '002e38db-2a03-4dc6-aedb-8732bb9e4060',
    clientSecret: 'cc3fe360-86e1-4fba-a74c-d78c5450f50d',
    //callbackURL: 'http://localhost:3000/authorization-code/callback',
    callbackURL: 'http://yg-demo-energy.somet.seekingtangents.com/',
    scope: 'openid profile email phone address'
  }

var auth0 = {
    issuer: 'https://dev-0tc6bn14.eu.auth0.com/',
    authorizationURL: 'https://dev-0tc6bn14.eu.auth0.com/authorize',
    tokenURL: 'https://dev-0tc6bn14.eu.auth0.com/oauth/token',
    userInfoURL: 'https://dev-0tc6bn14.eu.auth0.com/userinfo',
    clientID: 'qce9HfoO2Gnrz1oAHERhANcnDfJngAuJ',
    clientSecret: 'TTdc5Wryh-9zwDpxwoQRNr1cMELEz6G9srIW46fceQe5MvwoVo2Y5Hd468ZnObRj',
    callbackURL: 'http://localhost:3000/authorization-code/callback',
    scope: 'openid profile email phone address'
}

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

// set up passport
/*passport.use('oidc', new OidcStrategy({
  issuer: 'https://yukon.vivvocloud.com',
  authorizationURL: 'https://yukon.vivvocloud.com/oauth/v2/authorize',
  tokenURL: 'https://yukon.vivvocloud.com/oauth/v2/token',
  userInfoURL: 'https://yukon.vivvocloud.com/oauth/v2/userinfo',
  clientID: '002e38db-2a03-4dc6-aedb-8732bb9e4060',
  clientSecret: 'cc3fe360-86e1-4fba-a74c-d78c5450f50d',
  callbackURL: 'http://localhost:3000/authorization-code/callback',
  scope: 'openid profile email phone address'
}, (issuer, sub, profile, accessToken, refreshToken, done) => {
  return done(null, profile)
}))
*/
passport.use('oidc', new OidcStrategy(vivvo, 
    (issuer, sub, profile, accessToken, refreshToken, done) => {
    return done(null, profile)
  }))

passport.serializeUser((user, next) => {
  next(null, user)
})

passport.deserializeUser((obj, next) => {
  next(null, obj)
})

app.use('/', indexRouter)
app.use('/users', usersRouter)

app.use('/login', passport.authenticate('oidc'))

app.use('/authorization-code/callback',
  passport.authenticate('oidc', { failureRedirect: '/error' }),
  (req, res) => {
    res.redirect('/profile')
  }
)

function ensureLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

app.use('/profile', ensureLoggedIn, (req, res) => {
  res.render('profile', { title: 'Energy Rebate', user: req.user })
})

app.get('/logout', (req, res) => {
  req.logout()
  req.session.destroy()
  res.redirect('/')
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
