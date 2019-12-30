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
  res.render('profile', { title: 'Express', user: req.user })
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
