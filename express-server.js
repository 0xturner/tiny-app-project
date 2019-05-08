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

app.post('/login', (req, res) => {             // set username cookie
  res.cookie("username", req.body.username);
  res.redirect('/urls');
})

app.get('/urls', function(req, res) {
  console.log("Cookie: " +req.cookies);
    let templateVars = { urls: urlDatabase,
                         username: req.cookies["username"]
                       }
    res.render("urls-index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] }
  res.render("urls-new", templateVars);
});


app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  let longURL = req.body.longURL;

  let shortURL = generateRandomString();

  addToDb(shortURL, longURL);
  console.log(urlDatabase);
  let templateVars = { shortURL: shortURL,
                       longURL: urlDatabase[shortURL],
                       username: req.cookies["username"]
                     };
  res.redirect('urls/' + shortURL)
  res.render("urls-show", templateVars)
});

app.post('/urls/:shortURL', (req, res) => { // update longURL
  const shorterURL = req.params.shortURL;
  // console.log("shortURL: " + shorterURL);
  const newURL = req.body.longURL;
  // console.log("Req Body: " + req.body);
  addToDb(shorterURL, newURL);

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
  let shortenedURL = req.params.shortURL;
  let templateVars = { shortURL: shortenedURL,
                       longURL: urlDatabase[shortenedURL],
                       username: req.cookies["username"]
                     };
  res.render("urls-show", templateVars);
});


var urlDatabase = {
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

function addToDb (shortURL, longURL) {
  urlDatabase[shortURL] = longURL;
}
// addToDb(generateRandomString(), "www.test.com");
