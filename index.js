const express = require('express');
const session = require('express-session');
const {secret} = require('./config');

const passport = require('passport');
const strategy = require('./strategy');

const request = require('request');

const port = 3000;
const app = express();

///////////////////////////////////
///////// authentication //////////
///////////////////////////////////

app.use( session({
  secret: secret,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize())
app.use(passport.session())
passport.use(strategy);

passport.serializeUser(function(user, done) {
  const {_json} = user;
  done(null,{clientID: _json.clientID,email: _json.email,name: _json.name,followers:_json.followers_url});
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

     //||||||| login/logout ||||||||

app.get('/login', passport.authenticate('auth0',
  {successRedirect: '/followers', 
  failureRedirect: '/login', 
  failureFlash: true, 
  connection: 'github'
})
);
app.get('/followers', (req,res,next)=> {
  if(req.user){
  const FollowersRequest ={
    url: req.user.followers,
    headers : {
      'User-Agent': req.user.clientID
    }
  };
  request(FollowersRequest, (error, response,body) =>{
    console.log(body);
    res.status(200).send(body);
  });
  }
  else {res.redirect('/login')}
});


//////////////////////////////////
///////// controllers ////////////
//////////////////////////////////


///////////////////////////////////
/////////// endpoints /////////////
///////////////////////////////////

app.listen( port, () => { console.log(`Andre ${port}`); } );