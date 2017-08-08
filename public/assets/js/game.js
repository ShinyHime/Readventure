var db = firebase.database();

firebase.auth().onAuthStateChanged(function (user) {
    var currentUser = user;

    db.ref('/users/' + currentUser.uid + '/level').on('value', function (level) {
        var currentLevel = level.val();

        if (currentLevel === null) {
            db.ref('/users/' + currentUser.uid + '/level').set(1);
        }
        else {
            updateLevel(currentLevel);
        }
    });

    function updateLevel(currentLevel) {

        var userClass;

        if (currentLevel <= 10) {
            userClass = 'Novice'
        } else if (currentLevel < 25) {
            userClass = 'Readventurer'
        } else {
            userClass = 'Master Readventurer'
        }

        db.ref('/users/' + currentUser.uid + '/userClass').set(userClass);

        var milestone;

        switch (userClass) {
            case 'Readventurer':
                milestone = (currentLevel * currentLevel) * 5
                break;
            case 'Master Readventurer':
                milestone = (currentLevel * currentLevel) * 8
                break;
            default:
                milestone = (currentLevel * currentLevel) * 3
        }

        console.log('Next level achieved after ' + milestone + ' pages read.');

        db.ref('/users/' + currentUser.uid + '/pagesRead').on('value', function (pagesRead) {
            var pageCount = pagesRead.val();

            if (pageCount >= milestone) {
                currentLevel++;
                console.log(currentLevel);
            }

            db.ref('/users/' + currentUser.uid + '/level').set(currentLevel);
        })
    }

    db.ref('/users/' + currentUser.uid + '/level').on('value', function (level) {
        var currentLevel = level.val();
        $('#userLevel').html('<h5>Level: <span id="currentLevelNumber">' + currentLevel + '</span></h5>');
    })

})