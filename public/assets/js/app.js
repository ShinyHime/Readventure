$(document).foundation()

$('#searchBook').on("click", function(event) {

  //Prevents form html from refreshing the page
  event.preventDefault();
  //store input from field in a variable
  var title = $('#bookInput').val().trim();
  var queryURL = "https://www.googleapis.com/books/v1/volumes?q=:" + title + "&maxResults=3";

  $.ajax({
  url: queryURL,
  method: "GET"
}).done(function(response) {

  console.log(response);


})

  $("#bookInput").val("");

})


function displayBookInfo() {
  var APIkey = "AIzaSyDA6jUVJy0nexi2oe7wmyLcm_EJmQ08eU0";
  var isbn = "0545010225";
  var queryURL = "https://www.googleapis.com/books/v1/volumes?q=isbn:" + isbn;

  $.ajax({
  url: queryURL,
  method: "GET"
}).done(function(response) {

})
}

$('#registerButton').click(function (e) {
    e.preventDefault();

    var name = $('#newUserName').val().trim();
    var email = $('#newUserEmail').val().trim();
    var password = $('#newUserName').val().trim();

    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
    });
})

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;
    // ...
  } else {
    // User is signed out.
    // ...
  }
});

$('#loginButton').click(function () {

})

function displayBookInfo() {
  var API
}

console.log("hi")
