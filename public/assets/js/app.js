

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
