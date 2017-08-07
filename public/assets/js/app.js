var db = firebase.database();

$(document).foundation()


$('#registerButton').click(function (e) {
    e.preventDefault();

    // get user's input for email and password
    var email = $('#newUserEmail').val().trim();
    var password = $('#newUserPassword').val().trim();

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function () {
            location.replace('readventures.html');
        })
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
            console.log(errorCode);
            console.log(errorMessage);
        });

});

$('#loginButton').click(function (e) {
    e.preventDefault();

    // get user's input for email and password
    var email = $('#email').val().trim();
    var password = $('#password').val().trim();

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function () {
            location.replace('readventures.html');
        })
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
            console.log(errorMessage);
        });
});

$('#logoutButton').click(function (e) {
    e.preventDefault();
    var currentUser = firebase.auth().currentUser;

    firebase.auth().signOut().then(function () {
        // Sign-out successful.
        location.replace('index.html');
        console.log('logged out');

    }).catch(function (error) {
        // An error happened.
    });
})

