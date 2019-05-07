var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.get('/urls', function(req, res) {
    let templateVars = { urls: urlDatabase}
    res.render("urls-index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls-new");
});

app.get("/urls/:shortURL", (req, res) => {
  let shortenedURL = req.params.shortURL;
  let templateVars = { shortURL: shortenedURL, longURL: urlDatabase[shortenedURL] };
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

