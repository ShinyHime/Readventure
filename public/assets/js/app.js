var db = firebase.database();

$(document).foundation()

$('#bookSearchButton').on("click", function (event) {

    var user = firebase.auth().currentUser;

    //Prevents form html from refreshing the page
    event.preventDefault();

    //store input from field in a variable
    var title = $('#bookInput').val().trim();
    var queryURL = "https://www.googleapis.com/books/v1/volumes?q=:" + title + "&maxResults=10";

    $.ajax({
        url: queryURL,
        method: "GET",
        type: "JSON"
    }).done(function (response) {

        $.each(response.items, function (index, book) {
            // console.log(book);
            var bookInfo = {
                title: book.volumeInfo.title,
                id: book.id,
                cover: book.volumeInfo.imageLinks.thumbnail,
                description: book.volumeInfo.description,
                pageCount: book.volumeInfo.pageCount,
                buyLink: book.saleInfo.buyLink
            }

            displayBookInfo(bookInfo);
        })
    })
    // clear book search input field
    $("#bookInput").val("");
})


function displayBookInfo(bookInfo) {
    $('#bookventures').empty();

    var bookCard = $('<div id="' + bookInfo.id + '" ontouchstart="this.classList.toggle("hover");">');
    var bookCardInner = $('<div>');
    var bookCardFront = $('<div>');
    var bookCardBack = $('<div>');
    var bookCardFrontContent = $('<span>');
    var bookCover = $('<img>').attr('src', bookInfo.cover);
    var removeButton = $('<button type="button" class="button removeButton">ADD</button>');

    bookCard.addClass('small-12 medium-4 large-3 cell bookCard flip-card')

    bookCardFrontContent.append(bookCover);

    bookCardFront.addClass('flip-card-inner-front')
        .append(bookCardFrontContent)
        .attr('data-key', bookInfo.id);

    bookCardBack.addClass('flip-card-inner-back')
        .append(removeButton)

    bookCardInner.addClass('flip-card-inner')
        .append(bookCardFront)
        .append(bookCardBack)

    bookCard
        .append(bookCardInner);

    $('#readventures').append(bookCard);
    $('#readventures').animate({
        opacity: 1.0
    }, 800);

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

$('#loginButton').click(function () {

})

firebase.auth().onAuthStateChanged(function (user) {

    window.user = user;

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