var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var morgan = require("morgan");
app.use(morgan('dev'));

var cookieParser = require('cookie-parser')
app.use(cookieParser())

var bcrypt = require('bcrypt');



app.post('/login', (req, res) => {
  let email = req.body.email;
  // console.log("Email in post request: " + email)
  let password = req.body.password;
  console.log("Result from email lookup function" + emailLookup(email) );
  if (emailLookup(email)) {
    console.log("EMails matched in post request")
    if (passwordValidator(email, password)) {
      // res.cookie("userID", req.body.id);
      res.redirect('/urls');
    } else {
      res.status(403).send("403: Wrong Password");
    }
  } else {
      res.status(403).send("403: Email not found")
  }
})

app.get("/login", (req, res) => {
  res.render("urls-login");
});

app.post('/logout', (req, res) => {     //user logout
  res.clearCookie("userID", users[req.cookies.userID].id);
  res.redirect('/urls');
})

app.post("/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body.email;
  // console.log("email: " + email)
  let password = req.body.password;
  if (email === "" || password === "" || emailLookup(email)) {
    res.status(400).send("400 Error");
  } else {
    users[id] = { "id": id,
                  "email": email,
                  "password": password
                };
    res.cookie("userID", id)
    console.log(users);
    res.redirect('/urls');
}
});

app.get("/register", (req, res) => {
  res.render("urls-register");
});

app.get('/urls', function(req, res) {
    let currentUser = null;
    if (users[req.cookies.userID]) {
      currentUser = users[req.cookies.userID].email
    }
    let templateVars = { urls: urlDatabase,
                         users: users,
                         user: currentUser
                       }
    res.render("urls-index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // const email = users[req.cookies.userID].email
    let currentUser = null;
    if (users[req.cookies.userID]) {
      currentUser = users[req.cookies.userID].email
    }
  let templateVars = {
                      users: users,
                      user: currentUser
                     }
  res.render("urls-new", templateVars);
});






app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
    let currentUser = null;
    if (users[req.cookies.userID]) {
      currentUser = users[req.cookies.userID].email
    }
  let longURL = req.body.longURL;

  let shortURL = generateRandomString();

  addToDb(shortURL, longURL, urlDatabase);
  console.log(urlDatabase);
  let templateVars = { shortURL: shortURL,
                       longURL: urlDatabase[shortURL],
                       users: users,
                       user: currentUser
                     };
  res.redirect('urls/' + shortURL)
  res.render("urls-show", templateVars)
});

app.post('/urls/:shortURL', (req, res) => { // update longURL
  const shorterURL = req.params.shortURL;
  // console.log("shortURL: " + shorterURL);
  const newURL = req.body.longURL;
  // console.log("Req Body: " + req.body);
  users.

  res.redirect('/urls');
})

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL] // delete from the DB

  res.redirect('/urls')
})


app.get("/u/:shortURL", (req, res) => {
  let shortenedURL = req.params.shortURL;
  const longURL = urlDatabase[shortenedURL];
  res.redirect(longURL);
});


app.get("/urls/:shortURL", (req, res) => {
    let currentUser = null;
    if (users[req.cookies.userID]) {
      currentUser = users[req.cookies.userID].email
    }
  let shortenedURL = req.params.shortURL;
  let templateVars = { shortURL: shortenedURL,
                       longURL: urlDatabase[shortenedURL],
                       users: users,
                       user: currentUser
                     };
  res.render("urls-show", templateVars);
});

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// console.log(urlDatabase["b2xVn2"]);
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result = Math.random().toString(36).substr(2, 6);
  return result;
}
// console.log(generateRandomString());

function addToDb (shortURL, longURL, database) {
  database[shortURL] = longURL;
}

function emailLookup (givenEmail) {
  let result;
  for (let userId in users){
    let email = users[userId].email;
    // console.log(userId);
    if(givenEmail === email){
      result = true;
      console.log("GIVEN EMAIL: " + givenEmail)
      console.log("EMAIL in DB: " + email)
      console.log("EMAIL Matched")
      return result;
    } else if (givenEmail !== email){
      result = false;
      console.log("GIVEN EMAIL: " + givenEmail)
      console.log("EMAIL in DB: " + email)
      console.log("EMAIL did not MATCH")
    }
  }
  console.log("Result: " + result);
  return result;
}

function passwordValidator (givenEmail, givenPassword) {
  let result;
  for (let userId in users){
    let email = users[userId].email;
    // console.log("GIVEN EMAIL: " + givenEmail)
    // console.log("EMAIL in DB: " + email)
    let password = users[userId].password;
    // console.log("GIVEN PASSWORD: " + givenPassword)
    // console.log("PASSWORD in DB: " + password)
    // console.log(userId);
    if (givenEmail === email && givenPassword === password){
      result = true;
      console.log("Password Matched")
    } else{
      result = false;
      console.log("Password did not Match")
    }
  }
  // console.log(result);
  return result;
}
// addToDb(generateRandomString(), "www.test.com");
