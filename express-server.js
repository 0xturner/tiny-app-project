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


/////////////////////////////////////////////////////


const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "funk"
  }
}


const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"},
  "9sm5xK": { longURL: "http://www.tsn.ca", userID: "aJ48lW"}
};


///////////////////////////////////////////////////



app.post('/login', (req, res) => {
  let email = req.body.email;
  // console.log("Email in post request: " + email)
  let password = req.body.password;
  console.log("Result from email lookup function" + emailLookup(email) );
  if (emailLookup(email)) {
    console.log("EMails matched in post request")
    if (passwordValidator(email, password)) {
      res.cookie("userID", passwordValidator(email, password));
      console.log(passwordValidator(email, password))
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



app.get("/urls/new", (req, res) => {
  // const email = users[req.cookies.userID].email
  if(users[req.cookies.userID]){
    let currentUser = null;
    if (users[req.cookies.userID]) {
      currentUser = users[req.cookies.userID].email
    }
  let templateVars = {
                      users: users,
                      user: currentUser
                     }
  res.render("urls-new", templateVars);
} else {
  res.redirect('/urls')
}
});

app.get('/urls', function(req, res) {
    let currentUser = null;
    let currentUserID = null;
    if (users[req.cookies.userID]) {
      currentUser = users[req.cookies.userID].email
      currentUserID = req.cookies["userID"]; //not working
    }
    console.log("CUUUUURRRRREEEENNNNNTTTTTT USSSSSSEEEEERRR IDDDDD: " + currentUserID);
    // validurls = urlsForUser(currentUserID);
    // console.log("Filterered IDs: " + validurls.b2xVn2.longURL);

    let templateVars = {
                         urls: urlDatabase,
                         // urls: validurls,
                         users: users,
                         user: currentUser
                       }
    res.render("urls-index", templateVars);
});


app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
    let currentUser = null;
    if (users[req.cookies.userID]) {
      currentUser = users[req.cookies.userID].id
    }
  let fullURL = req.body.longURL;

  let shortURL = generateRandomString();

  let key = {longURL: fullURL,
             userID: currentUser
            }
  urlDatabase[shortURL] = key
  // addToDb(shortURL, longURL, urlDatabase);
  console.log("shortURL: : " + shortURL)
  console.log("fullURL: : " + fullURL)
  console.log("Key: " + key.longURL)
  // console.log("Second Key: " + urlDatabase.abcdef.longURL)
  console.log("urlDatabase: : " + urlDatabase)
  // urlDatabase[shortURL].longURL = fullURL;
  console.log(urlDatabase);
  let templateVars = { shortURL: shortURL,
                       // longURL: urlDatabase[shortURL].longURL,
                       users: users,
                       user: currentUser
                     };
  res.redirect('/urls/' + shortURL)
  res.render("urls-show", templateVars)
});

app.post('/urls/:shortURL', (req, res) => { // update longURL
  const shorterURL = req.params.shortURL;
  console.log("shortURL: " + shorterURL);
  const newURL = req.body.longURL;
  console.log("Req Body: " + req.body);
  console.log("NewURL: " + newURL)
  urlDatabase[shorterURL].longURL = newURL


  res.redirect('/urls');
})

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL
  if (users[req.cookies.userID]) {
    const currentUserID = users[req.cookies.userID].id

    if (belongsTo(currentUserID, shortURL)) {
      delete urlDatabase[shortURL]; // delete from the DB
      res.redirect('/urls');
    } else {
      console.log("Unable to delete");
      res.send("Unable to delete");
    }
  } else {
    console.log("Unable to delete");
    res.send("Unable to delete");
  }
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
      // console.log("Corresponding long URL: " + urlDatabase[req.params.shortURL].longURL)
    }

  let shortenedURL = req.params.shortURL;
  let templateVars = { shortURL: shortenedURL,
                       urls: urlDatabase,
                       // longURL: urlDatabase[shortenedURL].longURL,
                       url: req.params.shortURL,
                       users: users,
                       user: currentUser
                     };
  res.render("urls-show", templateVars);
});



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
      // console.log("GIVEN EMAIL: " + givenEmail)
      // console.log("EMAIL in DB: " + email)
      // console.log("EMAIL Matched")
      return result;
    } else if (givenEmail !== email){
      result = false;
      // console.log("GIVEN EMAIL: " + givenEmail)
      // console.log("EMAIL in DB: " + email)
      // console.log("EMAIL did not MATCH")
    }
  }
  console.log("Result: " + result);
  return result;
}

function passwordValidator (givenEmail, givenPassword) {
  let result;
  for (let userId in users){
    let email = users[userId].email;
    let password = users[userId].password;
    let UserId = userId

    if (givenEmail === email && givenPassword === password){
      result = true;
      // console.log("Password Matched")

      return UserId;
    } else{
      result = false;
      // console.log("Password did not Match")
    }
  }
  // console.log(result);
  return result;
}

function filterURLS(user) {
  const validobjIDs = []
  for (let objID in urlDatabase) {
    let url = urlDatabase[objID].longURL;
    let userID = urlDatabase[objID].userID;
    console.log("UserID in filter function: " + userID)
    console.log("Current User in filter function: " + user)
    if (user === userID) {
      console.log("USERID MATCH");
      validobjIDs.push(objID);
    }
    console.log("validobjIDs: " + validobjIDs);
    // return validobjIDs;
  }
  return validobjIDs;
}

const urlsForUser = (id) => {
 let urlsUser = {};
 for (let key in urlDatabase) {
   if (urlDatabase[key].userID === id) {
     urlsUser[key] = urlDatabase[key];
     console.log("urls USER: " + urlsUser[key])
   }
   // console.log("urls USERRRRRRRR: " + urlsUser.b2xVn2.longURL);
   // console.log("urlDBBBBBB: " + urlDatabase);
 }
 // console.log("urls USER: " + urlsUser)
 return urlsUser;
}

function belongsTo(currentUser, shortURL) {
  console.log("User ID in belongsTo: " + urlDatabase[shortURL].userID)
  console.log("currentUser in belongsTo: " + currentUser)
  if (urlDatabase[shortURL].userID === currentUser) {
    console.log("ids match, can delete")
    return true;
  } else {
    console.log("ids don't match, can't delete");
    return false;
  }
}
// addToDb(generateRandomString(), "www.test.com");
