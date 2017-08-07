var db = firebase.database();

var currentUser;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        currentUser = user;
        initBookventure();
    } else {
        alert('User is not logged in');
        location.replace('login.html');
    }
})

function initBookventure() {

    function setAvatar() {
        // $('#userAvatar').attr('src', 'assets/images/userPlaceholder.png');
        db.ref('/users/' + currentUser.uid + '/avatar').on('value', function (avatar) {
            var avatarSrc = avatar.val();

            console.log(avatarSrc);

            if (avatarSrc !== null) {
                $('#userAvatar').attr('src', avatarSrc);
            } else {

                $('#userAvatar').attr('src', 'assets/images/userPlaceholder.png');
            }

        });

        $('.avatarChoice').click(function () {
            var selectedAvatarUrl = $(this).attr('data-avatarSource');

            console.log(selectedAvatarUrl);
            db.ref('/users/' + currentUser.uid + '/avatar').set(selectedAvatarUrl);
        });
    };

    setAvatar();

    $('#bookSearchButton').click(function (event) {

        var user = firebase.auth().currentUser;
        var action = 'search';

        //Prevents form html from refreshing the page
        event.preventDefault();
        $('#readventuresTitle').css('opacity', '0')

        $('#readventuresTitle').html('Add Book to My Readventures!');
        $('#readventuresTitle').animate({
            opacity: 1.0
        }, 800);

        //store input from field in a variable
        var title = $('#bookInput').val().trim();
        var queryURL = "https://www.googleapis.com/books/v1/volumes?q=:" + title + "&maxResults=10";

        $.ajax({
            url: queryURL,
            method: "GET",
            type: "JSON"
        }).done(function (response) {
            $('#bookResults').empty();
            $('#readventures').empty();

            $.each(response.items, function (index, book) {
                // console.log(book);
                var bookInfo = {
                    title: book.volumeInfo.title,
                    author: book.volumeInfo.authors[0],
                    id: book.id,
                    cover: book.volumeInfo.imageLinks.thumbnail,
                    // description: book.volumeInfo.description,
                    description: book.searchInfo.textSnippet,
                    pageCount: book.volumeInfo.pageCount,
                    // currentPage: 0
                }

                displayBook(bookInfo, action);
            })
        })
        // clear book search input field
        $("#bookInput").val("");
    });

    function displayBook(bookInfo, action) {

        var bookCard = $('<div id="' + bookInfo.id + '" ontouchstart="this.classList.toggle("hover");">');
        var bookCardInner = $('<div>');
        var bookCardFront = $('<div>');
        var bookCardBack = $('<div>');
        var bookCardFrontContent = $('<span>');
        var bookCardTitle = $('<div>').html('<h4>' + bookInfo.title + '</h4>');
        var bookCardAuthor = $('<div>').html('<h5>' + bookInfo.author + '</h5>');
        var bookCardPageCount = $('<div>').html('<h6>' + bookInfo.pageCount + ' Pages</h6>');
        var bookCover = $('<img>').attr('src', bookInfo.cover);
        var cardBackButton = $('<button type="button" class="button"></button>');

        bookCard.addClass('small-12 medium-6 large-4 cell flip-card')

        bookCardFrontContent.append(bookCover);

        bookCardFront.addClass('flip-card-inner-front')
            .append(bookCardFrontContent)
            .attr('data-key', bookInfo.id);

        bookCardBack.addClass('flip-card-inner-back')
            .append(bookCardTitle)
            .append(bookCardAuthor)
            .append(bookCardPageCount)
            .append(cardBackButton);


        bookCardInner.addClass('flip-card-inner')
            .append(bookCardFront)
            .append(bookCardBack)

        bookCard
            .append(bookCardInner);

        if (action === 'search') {
            $('#bookResults').append(bookCard);
            cardBackButton.html('ADD')
                .click(function () {
                    addReadventure(bookInfo);
                })
        }

        if (action === 'readventure') {
            $('#readventures').append(bookCard);
            cardBackButton.html('Readventure!')
                .click(function () {
                    startReadventure(bookInfo);
                });
        }

        $('#readventures').animate({
            opacity: 1.0
        }, 800);

    };

    function addReadventure(bookInfo) {
        var currentUser = firebase.auth().currentUser;
        console.log(bookInfo.id);

        db.ref('/books/' + currentUser.uid + '/' + bookInfo.id).set(bookInfo);

        displayUserReadventures();
    };

    function displayUserReadventures() {
        $('#readventureToolButtons').empty();

        var action = 'readventure';

        $('#readventuresTitle').html('My Readventures');
        $('#readventuresTitle').animate({
            opacity: 1.0
        }, 800);

        $('#readventures').empty();

        db.ref('/books/' + currentUser.uid).on('child_added', function (book) {

            var bookInfo = book.toJSON();

            displayBook(bookInfo, action);

        })
    };

    function startReadventure(bookInfo) {

        $('#readventures').empty();

        $('#menuActionButton').off().hide();
        $('#bookSearch').hide();

        $('#menuBackButton').show()
            .click(function () {
                displayUserReadventures();
                $('#menuBackButton').hide();
                $('#bookSearch').show();
                $('#menuActionButton').show();
            });

        $('#readventuresTitle').html(bookInfo.title.toUpperCase());
        $('#readventuresTitle').animate({
            opacity: 1.0
        }, 800);


        var readventureBookInfo = $('<div>').addClass('small-12 medium-4 cell').attr('id', 'readventureBookInfo');
        var readventureInfo = $('<div>').addClass('small-12 medium-5 cell').attr('id', 'readventureInfo');
        var readventureToolHolder = $('<div>').addClass('small-12 medium-3 cell').attr('id', 'readventureToolHolder');

        $('#readventures').append(readventureBookInfo);
        buildReadventureBook(bookInfo);

        $('#readventures').append(readventureInfo);
        buildReadventureInfo(bookInfo.id);

        $('#readventures').append(readventureToolHolder);

        buildToolIcons(bookInfo.id);
        buildTreasures();
    };

    function buildReadventureBook(bookInfo) {

        var bookInfoHolder = $('<div>').addClass('grid-x grid-padding-x grid-margin-y');
        var bookCover = $('<div>').addClass('small-12 cell').html('<img src="' + bookInfo.cover + '" id="readventureBookCover">');
        var bookAuthor = $('<div>').addClass('small-12 cell readventureAuthor');

        bookAuthor.html('<h3>by: ' + bookInfo.author + '</h3>')
        // .html('<p>' + bookInfo.author + '</p>');

        bookInfoHolder.append(bookCover)
            .append(bookAuthor);

        $('#readventureBookInfo').append(bookInfoHolder);

        $('#readventures').append(readventureBookInfo);

    };

    function buildReadventureInfo(id) {
        console.log(currentUser.uid);
        console.log(id);

        var notesHolder = $('<div>').addClass('grid-x');

        db.ref('/books/' + '/' + currentUser.uid + '/' + id + '/notes').on('child_added', function (child) {
            var note = child.toJSON();

            notesHolder.append('<div class="small-12">' + note.note + '</div>');
        })

        $('#readventureInfo').append(notesHolder);
    };

    function buildToolIcons(id) {
        var tools = $('<div>').addClass('small-12 medium-5 cell');
        var readventureTools = $('<div>').addClass('grid-x grid-margin-y align-right');

        var bookmark = $('<div>').addClass('small-2 cell readventureTools');
        var bookmarkButton = $('<i class="fi-book-bookmark menuIcon" id="menuBackButton" data-toggle="bookmarkModal"></i>');
        var dictionary = $('<div>').addClass('small-2 cell readventureTools');
        var dictionaryButton = $('<i class="fi-quote menuIcon" id="menuBackButton" data-toggle="dictionaryModal"></i>');
        var notes = $('<div>').addClass('small-2 cell readventureTools');
        var notesButton = $('<i class="fi-page-edit menuIcon" id="menuBackButton" data-toggle="notesModal"></i>');

        bookmark.append(bookmarkButton)
            .click(function () {
                bookmarkPage(id);
                $('#readventuresHeader').toggleClass('modalHide');
            });

        dictionary.append(dictionaryButton);

        notes.append(notesButton)
            .click(function () {
                takeNote(id);
                $('#readventuresHeader').toggleClass('modalHide');
            });

        readventureTools.append(bookmark)
            .append(dictionary)
            .append(notes);

        tools.append(readventureTools);

        $('#readventureToolButtons').append(tools);
    };

    //FOR DICTIONARY API
    // $('#dictionaryButton').click(function (event) {
    function lookupWord() {
        var apiCreds = '48941ca8';
        var queryURL = 'https://od-api.oxforddictionaries.com/api/v1&app_id=4891ca8'
    };

    function takeNote(id) {
        console.log(id);

        $('#addNoteButton').click(function () {

            var note = {
                note: $('#noteInput').val().trim(),
                noteTitle: $('#noteTitle').val().trim(),
                notePageNumber: $('#notePageNumber').val().trim(),
                time: firebase.database.ServerValue.TIMESTAMP
            };

            console.log(note);

            db.ref('/books/' + currentUser.uid + '/' + id + '/notes').push(note);
        });

        $('#noteInput').val('');
    };

    function bookmarkPage(id) {

        var bookmarkHolder = $('<div>').addClass('grid-x grid-margin-x');

        var pageNumberHolder = $('<div>').addClass('input-group plus-minus-input small-12 cell').attr('id', 'bookMarkInput');

        var pageNumber = $('<input class="input-group-field" type="number" name="quantity" value="0" id="currentPageNumber">');

        var minusHolder = $('<div>').addClass('input-group-button');
        var minusButton = $('<button type="button" class="button hollow circle" data-quantity="minus" data-field="quantity"><i class="fi-minus" aria-hidden="true"></i></button>');

        var plusHolder = $('<div>').addClass('input-group-button');
        var plusButton = $('<button type="button" class="button hollow circle" data-quantity="plus" data-field="quantity"><i class="fi-plus" aria-hidden="true"></i></button>');

        // var bookmarkButton = $('<div class="small-12 cell"><input type="button" class="success button" value="Bookmark"></div>')

        var bookmarkButton = $('<input type="button" class="small-12 cell button" value="Bookmark" data-close>')

        minusHolder.append(minusButton);
        plusHolder.append(plusButton);

        pageNumberHolder.append(minusHolder)
            .append(pageNumber)
            .append(plusHolder)

        bookmarkHolder.append(pageNumberHolder)
            .append(bookmarkButton);

        db.ref('/books/' + currentUser.uid + '/' + id + '/currentPage').on('value', function (currentPage) {
            var currentPage = currentPage.val();
            pageNumber.val(currentPage);
        })

        bookmarkButton.click(function () {
            var pageNumberInputValue = $('#currentPageNumber').val().trim();
            var currentPageNumber = parseInt(pageNumberInputValue);
            console.log(currentPageNumber);
            db.ref('/books/' + currentUser.uid + '/' + id + '/currentPage').set(currentPageNumber);

            db.ref('/books/' + currentUser.uid + '/' + id + '/currentPage').on('value', function (currentPage) {
                var currentPage = currentPage.val();
            })

            calculatePagesRead()

            db.ref('/users/' + currentUser.uid + '/totalPagesRead').once('value')
                .then(function (totalPageCount) {

                });

            $('#readventuresHeader').toggleClass('modalHide');
        });

        $('#bookmarkModalContent').html(bookmarkHolder);

        $('[data-quantity="plus"]').click(function (e) {
            // Stop acting like a button
            e.preventDefault();
            // Get the field name
            fieldName = $(this).attr('data-field');
            // Get its current value
            var currentVal = parseInt($('input[name=' + fieldName + ']').val());
            // If is not undefined
            if (!isNaN(currentVal)) {
                // Increment
                $('input[name=' + fieldName + ']').val(currentVal + 1);
            } else {
                // Otherwise put a 0 there
                $('input[name=' + fieldName + ']').val(0);
            };
        });
        // This button will decrement the value till 0
        $('[data-quantity="minus"]').click(function (e) {
            // Stop acting like a button
            e.preventDefault();
            // Get the field name
            fieldName = $(this).attr('data-field');
            // Get its current value
            var currentVal = parseInt($('input[name=' + fieldName + ']').val());
            // If it isn't undefined or its greater than 0
            if (!isNaN(currentVal) && currentVal > 0) {
                // Decrement one
                $('input[name=' + fieldName + ']').val(currentVal - 1);
            } else {
                // Otherwise put a 0 there
                $('input[name=' + fieldName + ']').val(0);
            };
        });
    };

    function buildTreasures() {
        var readventureTreasures = $('<div>').addClass('small-12 cell');

    };


    $('#currentReadventuresButton').click(function () {
        displayUserReadventures();
        $("#overlay-nav-menu").toggleClass("is-open");
        $('#readventures').toggleClass('is-open');
    });

    $(document).ready(function () {
        displayUserReadventures();
    });
};
