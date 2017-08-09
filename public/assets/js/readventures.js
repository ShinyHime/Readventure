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
        var queryURL = "https://www.googleapis.com/books/v1/volumes?q=:" + title + "&maxResults=10&maxAllowedMaturityRating=not-mature";

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
        var cardBackButton = $('<button type="button" data-close class="button"></button>');

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
                    $("#overlay-nav-menu").toggleClass("is-open");
                    $('#readventures').toggleClass('is-open');
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

        $('#notesHolder').hide();
        $('#definitionsHolder').hide();
        $('#treasuresHolder').hide();

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


        var readventureBookInfo = $('<div>').addClass('small-12 cell').attr('id', 'readventureBookInfo');
        var readventureInfo = $('<div>').addClass('small-12 medium-5 cell').attr('id', 'readventureInfo');
        var readventureToolHolder = $('<div>').addClass('small-12 medium-3 cell').attr('id', 'readventureToolHolder');

        $('#readventures').append(readventureBookInfo);
        buildReadventureBook(bookInfo);

        $('#readventures').append(readventureInfo);
        buildNotes(bookInfo.id);
        buildDefinitions(bookInfo.id);
        buildTreasures(bookInfo.id);

        $('#readventures').append(readventureToolHolder);

        $('#notesHolder').show('slow');
        $('#definitionsHolder').show('slow');
        $('#treasuresHolder').show('slow');

        buildToolIcons(bookInfo.id);
    };

    function buildReadventureBook(bookInfo) {

        var bookInfoHolder = $('<div>').addClass('grid-x grid-padding-x grid-margin-y align-center');
        var bookCover = $('<div>').addClass('small-6 medium-4 large-4 cell').html('<img src="' + bookInfo.cover + '" id="readventureBookCover">');
        var bookDetails = $('<div>').addClass('small-12 medium-12 large-8 cell readventureBookDetails');
        var bookTitle = $('<h3>');
        var bookAuthor = $('<h5>');
        var bookProgressBar = $('<div>').addClass('progress');
        var bookProgressMeter = $('<div>').addClass('progress-meter').attr('id', bookInfo.id + 'ProgressMeter');
        var bookProgressRatio = $('<div>').addClass('progressRatio').attr('id', bookInfo.id + 'ProgressRatio');

        bookTitle.html('<h3>' + bookInfo.title + '</h3>')
        bookAuthor.html('<h5>by: ' + bookInfo.author + '</h5>')

        bookProgressBar.html(bookProgressMeter);

        bookDetails.append(bookTitle)
            .append(bookAuthor)
            .append(bookProgressBar)
            .append(bookProgressRatio);

        bookInfoHolder.append(bookCover)
            .append(bookDetails);

        $('#readventureBookInfo').append(bookInfoHolder);

        $('#readventures').append(readventureBookInfo);

        bookProgress(bookInfo.id, bookInfo.pageCount);
    };

    function bookProgress(id, pageCount) {
        db.ref('/books/' + currentUser.uid + '/' + id + '/currentPage').on('value', function (currentPage) {
            var currentPageNumber = currentPage.val();
            var progress = currentPageNumber / pageCount * 100;
            console.log(progress);

            $('#' + id + 'ProgressMeter').animate({
                width: progress + '%'
            })

            $('#' + id + 'ProgressRatio').html('<h5>' + currentPageNumber + ' / ' + pageCount + ' pages read</h5>');

        })
    }

    function buildNotes(id) {
        $('#notesHolder').empty();

        var notesHolder = $('<div>').addClass('grid-x grid-padding-x');
        var notesTitle = $('<div>').addClass('small-12 cell readventureInfoTitle').html('<h3>My Notes</h3>');

        notesHolder.append(notesTitle);

        db.ref('/notes/' + '/' + currentUser.uid + '/' + id).on('child_added', function (child) {
            var note = child.toJSON();

            notesHolder.append('<div class="small-2 note">p. ' + note.notePageNumber + '</div>');
            notesHolder.append('<div class="small-10 note">' + note.note + '</div>');
        });

        $('#notesHolder').append(notesHolder);
    };

    function buildDefinitions(id) {
        $('#definitionsHolder').empty();

        var definitionsHolder = $('<div>').addClass('grid-x grid-padding-x');
        var definitionsTitle = $('<div>').addClass('small-12 cell readventureInfoTitle').html('<h3>My Words</h3>');

        definitionsHolder.append(definitionsTitle);

        // db.ref('/books/' + '/' + currentUser.uid + '/' + id + '/definitions').on('child_added', function (child) {
        //     var definition = child.toJSON();

        //     definitionsHolder.append('<div class="small-12 note">' + definition.definition + '</div>');
        // });

        $('#definitionsHolder').append(definitionsHolder);
    };

    function buildTreasures(id) {
        console.log('treasures');
        $('#treasuresHolder').empty();

        var treasuresHolder = $('<div>').addClass('grid-x grid-padding-x');
        var treasuresTitle = $('<div>').addClass('small-12 cell readventureInfoTitle').html('<h3>Treasure</h3>');

        treasuresHolder.append(treasuresTitle);

        // db.ref('/books/' + '/' + currentUser.uid + '/' + id + '/treasures').on('child_added', function (child) {
        //     var definition = child.toJSON();

        //     treasuresHolder.append('<div class="small-12 note">' + definition.definition + '</div>');
        // });

        $('#treasuresHolder').append(treasuresHolder);
    };

    function buildToolIcons(id) {
        var tools = $('<div>').addClass('small-12 medium-5 cell');
        var readventureTools = $('<div>').addClass('grid-x grid-margin-y align-right');

        var bookmark = $('<div>').addClass('small-3 medium-2 cell readventureTools').attr('data-toggle', 'bookmarkModal');
        var bookmarkButton = $('<i class="fi-book-bookmark menuIcon" id="menuBookmarkButton"></i>');
        var dictionary = $('<div>').addClass('small-3 medium-2 cell readventureTools').attr('data-toggle', 'dictionaryModal');
        var dictionaryButton = $('<i class="fi-quote menuIcon" id="menuDictionaryButton"></i>');
        var notes = $('<div>').addClass('small-3 medium-2 cell readventureTools').attr('data-toggle', 'notesModal');
        var notesButton = $('<i class="fi-page-edit menuIcon" id="menuNotesButton"></i>');

        bookmark.append(bookmarkButton)
            .click(function () {
                bookmarkPage(id);
                $('#headerNav').toggleClass('modalHide');
                $('#readventureToolButtons').toggleClass('modalHide');
            });

        dictionary.append(dictionaryButton);

        notes.append(notesButton)
            .click(function () {
                takeNote(id);
                $('#headerNav').toggleClass('modalHide');
                $('#readventureToolButtons').toggleClass('modalHide');
            });

        readventureTools.append(bookmark)
            .append(dictionary)
            .append(notes);

        tools.append(readventureTools);

        $('#readventureToolButtons').append(readventureTools);
    };

    //FOR DICTIONARY API
    // $('#dictionaryButton').click(function (event) {
    function lookupWord() {
        var apiCreds = '48941ca8';
        var queryURL = 'https://od-api.oxforddictionaries.com/api/v1&app_id=4891ca8'
    };

    function takeNote(id) {
        $('#addNoteButton').click(function () {

            var note = {
                note: $('#noteInput').val().trim(),
                noteTitle: $('#noteTitle').val().trim(),
                notePageNumber: parseInt($('#notePageNumber').val().trim()),
                time: firebase.database.ServerValue.TIMESTAMP
            };

            if (note.note !== '' && note.noteTitle !== '' && note.notePageNumber) {

                $('#headerNav').toggleClass('modalHide');
                $('#readventureToolButtons').toggleClass('modalHide');

                db.ref('/notes/' + currentUser.uid + '/' + id).push(note);
            } else {
                $('#headerNav').toggleClass('modalHide');
                $('#readventureToolButtons').toggleClass('modalHide');
                alert('Please fill out all note information fields.');
            }

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

            db.ref('/books/' + currentUser.uid + '/' + id + '/currentPage').once('value', function (currentPage) {
                var previousPageNumber = currentPage.val();
                var newPageNumber = parseInt($('#currentPageNumber').val().trim());

                db.ref('/books/' + currentUser.uid + '/' + id + '/pageCount').once('value', function (pageCount) {
                    var pageCount = pageCount.val();

                    if (newPageNumber <= pageCount) {
                        newPageNumber -= previousPageNumber;

                        updateUserPagesRead(previousPageNumber, newPageNumber);

                        db.ref('/books/' + currentUser.uid + '/' + id + '/currentPage').set(currentPageNumber);
                    } else {
                        alert('This book does not have that many pages!')
                    }
                })
            })

            $('#headerNav').toggleClass('modalHide');
            $('#readventureToolButtons').toggleClass('modalHide');
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

    function updateUserPagesRead(previousPageNumber, newPageNumber) {

        db.ref('/users/' + currentUser.uid + '/pagesRead').once('value', function (currentCount) {
            var currentCount = currentCount.val();

            if (currentCount === null) {
                db.ref('/users/' + currentUser.uid + '/pagesRead').set(previousPageNumber);
            }

            if (currentCount === 0) {
                db.ref('/users/' + currentUser.uid + '/pagesRead').set(previousPageNumber);
            } else {
                currentCount += newPageNumber;
                db.ref('/users/' + currentUser.uid + '/pagesRead').set(currentCount);
            }
        })
    }

    db.ref('/users/' + currentUser.uid + '/pagesRead').on('value', function (pagesRead) {
        if (pagesRead.val() !== null) {
            $('#userPagesRead').html('<h5><span id="totalPages"> <i class="fi-book"> </i>' + pagesRead.val() + ' points</span></h5>')
        } else {
            $('#userPagesRead').html('<h5><span id="totalPages"> <i class="fi-book"> </i>0 points</span></h5>')
        }
    })

    $('#currentReadventuresButton').click(function () {
        displayUserReadventures();
        $("#overlay-nav-menu").toggleClass("is-open");
        $('#readventures').toggleClass('is-open');
    });

    $('.menuIcon').click(function () {
        $('#headerNav').toggleClass('modalHide');
        $('#readventureToolButtons').toggleClass('modalHide');
    });

    $(document).ready(function () {
        displayUserReadventures();
    });
};
