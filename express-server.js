const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const morgan = require("morgan");
app.use(morgan('dev'));


const cookieSession = require('cookie-session');
app.use(cookieSession({
  keys: ['secretkey']
}));

const bcrypt = require('bcrypt');


//////////////////////////////////////////////////////////////
// DATABASE:'

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("funk", 10)
  }
};

const urlDatabase = {
  b2xVn2: {
     longURL: "http://www.lighthouselabs.ca",
     userID: "aJ48lW"},
  "9sm5xK": {
     longURL: "http://www.tsn.ca",
     userID: "aJ48lW"
  }
};


//////////////////////////////////////////////////////////////
// FUNCTIONS:

function generateRandomString() {
  const result = Math.random().toString(36).substr(2, 6);
  return result;
}

function addToDb (shortURL, longURL, database) {
  database[shortURL] = longURL;
}

function emailLookup (givenEmail) {
  let result;
  for (let userId in users){
    let email = users[userId].email;
    if(givenEmail === email){
      result = true;
      return result;
    } else if (givenEmail !== email){
      result = false;
    }
  }
  return result;
}

function passwordValidator (givenEmail, givenPassword) {
  let result;
  for (let userId in users){
    let email = users[userId].email;
    let hashedPassword = users[userId].password;
    let UserId = userId;

    if (givenEmail === email && bcrypt.compareSync(givenPassword, hashedPassword)){
      result = true;
      return UserId;
    } else{
      result = false;
    }
  }
  return result;
}

function filterURLS(user) {
  const validobjIDs = [];
  for (let objID in urlDatabase) {
    let url = urlDatabase[objID].longURL;
    let userID = urlDatabase[objID].userID;
    if (user === userID) {
      validobjIDs.push(objID);
    }
  }
  return validobjIDs;
}

const urlsForUser = (id) => {
 let urlsUser = {};
 for (let key in urlDatabase) {
   if (urlDatabase[key].userID === id) {
     urlsUser[key] = urlDatabase[key];
   }
 }
 return urlsUser;
};

function belongsTo(currentUser, shortURL) {
  if (urlDatabase[shortURL].userID === currentUser) {
    return true;
  } else {
    return false;
  }
}


//////////////////////////////////////////////////////////////
//POST ROUTES:

app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  if (emailLookup(email)) {
    if (passwordValidator(email, password)) {
      req.session.userID = passwordValidator(email, password);
      res.redirect('/urls');
    } else {
      res.status(403).send("403: Wrong Password");
    }
  } else {
    res.status(403).send("403: Email not found");
  }
});

app.post('/logout', (req, res) => {
  if(users[req.session.userID]) {
    req.session = null;
    res.redirect('/urls');
  } else {
    res.redirect('/urls');
  }
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === "" || password === "" || emailLookup(email)) {
    res.status(400).send("400 Error");
  } else {
      users[id] = {
        "id": id,
        "email": email,
        "password": hashedPassword
      };
      req.session.userID = id;
      res.redirect('/urls');
  }
});

app.post("/urls", (req, res) => {
  let currentUser = null;
  if (users[req.session.userID]) {
    currentUser = users[req.session.userID].id;
  }
  let fullURL = req.body.longURL;
  let shortURL = generateRandomString();
  let key = {
    longURL: fullURL,
    userID: currentUser
    };
  urlDatabase[shortURL] = key;
  let templateVars = {
    shortURL: shortURL,
    users: users,
    user: currentUser
  };
  res.redirect('/urls/' + shortURL);
  res.render("urls-show", templateVars);
});

app.post('/urls/:shortURL', (req, res) => { // update longURL
  const currentUserID = null;
  if (users[req.session.userID]) {
    const currentUserID = users[req.session.userID].id;
    const shorterURL = req.params.shortURL;
    const newURL = req.body.longURL;

    if (belongsTo(currentUserID, shorterURL)) {
      urlDatabase[shorterURL].longURL = newURL;
      res.redirect('/urls');
    } else {
      res.send("Can't edit url that does not belong to user");
    }
  } else {
      res.send("Can't edit url that does not belong to user");
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (users[req.session.userID]) {
    const currentUserID = users[req.session.userID].id;

    if (belongsTo(currentUserID, shortURL)) {
      delete urlDatabase[shortURL]; // delete from the DB
      res.redirect('/urls');
    } else {
      res.send("Unable to delete");
    }
  } else {
    res.send("Unable to delete");
  }
});


//////////////////////////////////////////////////////////////
//GET ROUTES:

app.get("/u/:shortURL", (req, res) => {
  let shortenedURL = req.params.shortURL;
  const longURL = urlDatabase[shortenedURL].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  res.render("urls-login");
});

app.get("/register", (req, res) => {
  res.render("urls-register");
});

app.get("/urls/new", (req, res) => {
  if(users[req.session.userID]){
    let currentUser = null;
    if (users[req.session.userID]) {
      currentUser = users[req.session.userID].email;
    }
    let templateVars = {
      users: users,
      user: currentUser
    };
    res.render("urls-new", templateVars);
  } else {
  res.redirect('/urls');
  }
});

app.get('/urls', function(req, res) {
  let currentUser = null;
  let currentUserID = null;
  if (users[req.session.userID]) {
    currentUser = users[req.session.userID].email;
    currentUserID = users[req.session.userID].id;
  }
  validurls = urlsForUser(currentUserID);

  let templateVars = {
    urls: validurls,
    users: users,
    user: currentUser
  };
  res.render("urls-index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let currentUser = null;
  if (users[req.session.userID]) {
    currentUser = users[req.session.userID].email;
  }
  let shortenedURL = req.params.shortURL;
  let templateVars = {
    shortURL: shortenedURL,
    urls: urlDatabase,
    url: req.params.shortURL,
    users: users,
    user: currentUser
  };
  res.render("urls-show", templateVars);
});


//////////////////////////////////////////////////////////////


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
