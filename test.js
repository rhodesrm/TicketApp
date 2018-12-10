var mysql = require('mysql');
var x = "Peter Zhang";
var y = "ztyloe61";


















var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cs411"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "INSERT INTO cs411_user_accounts (Username, User_ID) VALUES ('"+x+"','"+y+"')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
});