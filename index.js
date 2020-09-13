/* eslint-disable indent */
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const db = require('./db');
const bc = require('./bc');
const cookieSession = require('cookie-session');
const csurf = require('csurf'); // get csurf middleware to prevent csrf
const { hash } = require('bcryptjs');


////////// HANDLEBARS SETTINGS /////////
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');


////////// MIDDLEWARE ////////////
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.urlencoded({ extended: false }));

app.use(csurf());

app.use(function (req, res, next) {
    // provide my templates with csrfToken
    res.locals.csrfToken = req.csrfToken();
    // prevent clickjacking
    res.setHeader("x-frame-options", "deny");
    next();
});

app.use(express.static('./public'));

/////////////////// ROUTE MIDDLEWARE FUNCTIONS ///////////////////
const requireLoggedOutUser = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/');
    } else {
        next();
    }
};

const requireLoggedInUser = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/register');
    } else {
        next();
    }
};

const allowNoSignature = (req, res, next) => {
    if (req.session.sigId) {
        res.redirect('/thanks');
    } else {
        next();
    }
};

const requireSignature = (req, res, next) => {
    if (!req.session.sigId) {
        res.redirect('/petition');
    } else {
        next();
    }
};

const requireNewUser = (req, res, next) => {
    if(!req.session.newUser) {
        res.redirect('/profile/edit');
    } else {
        next();
    }
};


////////////////////////// ROOT ROUTE REQUESTS ///////////////////////
app.get('/', (req, res) => {
    res.redirect('/petition');
});


//////////////////////// REGISTER REQUESTS //////////////////////
app.get('/register', requireLoggedOutUser, (req, res) => {

    res.render('register', {
        layout: 'main'
    });

});

app.post('/register', requireLoggedOutUser, (req, res) => {

    let { first, last, email, password } = req.body;
    // encode the password provided by user (from req.body)
    bc.hash(password)
        .then((hashedPassword) => {
            // insert the hashed password into the database along with other user information
            db.addUser(first, last, email, hashedPassword)
                .then(({ rows }) => {

                    const { id } = rows[0];
                    // store user's id in a cookie to define her as registered/logged in
                    req.session.userId = id;
                    // store the information in the cookie to indicate a newly registered user (to allow the access to /profile)
                    req.session.newUser = true;

                    res.redirect('/profile');
                    
                })
                .catch((err) => {
                    console.log("ERR in addUser: ", err);

                    res.render("register", {
                        layout: "main",
                        helpers: {
                            addVisibility() {
                                return "visible";
                            },
                        },
                    });
                });

        })
        .catch((err) => console.log('err in hash: ', err));

});


//////////////////////////// LOGIN REQUESTS ///////////////////////////
app.get('/login', requireLoggedOutUser, (req, res) => {

    res.render("login", {
        layout: "main",
    });

});

app.post('/login', (req, res) => {

    
    const { email, password } = req.body;
    // the function also checks validity of the email address 
    // as it won't work with an address which is not present in the table
    db.checkPassword(email)
        .then(( {rows} ) => {
            const { password:encodedPassword, id } = rows[0];
            // check if the password is valid for this email
            bc.compare(password, encodedPassword)
                .then((result) => {

                    if (result == true) {
                        // place user's id in the cookie to define her as logged in
                        req.session.userId = id;
                        // check if the user has signed the petition
                        db.checkIfSigned(req.session.userId)
                            .then(({ rows }) => {

                                if (rows[0] == undefined) {
                                    res.redirect('/petition');
                                } else {
                                    req.session.sigId = rows[0].id;

                                    res.redirect("/thanks");
                                }

                            })
                            .catch(err => console.log('err in checkIfSigned: ', err));

                    // if the password isn't matching display an error message
                    } else {
                        res.render("login", {
                            layout: "main",
                            helpers: {
                                addVisibility() {
                                    return "visible";
                                },
                            },
                        });
                    }
                
                })
                .catch(err => console.log('err in compare: ', err)); // closes catch on compare

        })
        .catch((err) => {
            console.log('err in checkPassword: ', err);

            res.render("login", {
                layout: "main",
                helpers: {
                    addVisibility() {
                        return "visible";
                    },
                },
            });
        });

});


///////////////////////// PETITION REQUESTS //////////////////////////
app.get('/petition', requireLoggedInUser, allowNoSignature, (req, res) => {
        res.render('petition', {
            layout: 'main',
        });
});

app.post('/petition', requireLoggedInUser, allowNoSignature, (req, res) => {
    // get the user data from the request
    const { signature } = req.body;
    // get the users.id from the cookie to store it in signatures table
    const { userId } = req.session;
    // use this data to create a new row in the database
    db.addSignature(signature, userId)
        .then(({ rows }) => {
            
            const { id } = rows[0]; 

            req.session.sigId = id;
        
            res.redirect('/thanks');

        })
        .catch((err) => {

            console.log('ERR in addSignature: ', err);

            res.render('petition', {
                layout: 'main',
                helpers: {
                    addVisibility() {
                        return 'visible';
                    }
                }
            });
        }); // closes catch

}); // closes post request on /petition


/////////////// THANKS REQUESTS ////////////////
app.get('/thanks', requireLoggedInUser, requireSignature, (req, res) => {
    // find the current signature id in the cookie
    let currSigId = req.session.sigId;

    db.countRows()
        .then(({ rows:allRows }) => {
            // get the row with the signature id to have an access to the image
            db.getCurrRow(currSigId).then(({ rows:currRow }) => {
                // join table data to get the first name of the current user
                db.getUserName(currSigId).then(({ rows }) => {

                    const { first } = rows[0];

                    res.render('thanks', {
                        layout: 'main',
                        currRow,
                        allRows,
                        first
                    });

                }).catch(err => console.log('error in getUserName: ', err));
                
                
            }).catch(err => console.log('error in getCurrRow: ', err)); // catch for getSigUrl

        })
        .catch((err) => {
            console.log('err in getSigUrl: ', err);
        }); // catch for countRows

}); // closes get request on /thanks

app.post('/thanks', requireLoggedInUser, requireSignature, (req, res) => {

    const { sigId } = req.session;
    
    db.deleteSignature(sigId)
        .then(() => {
            req.session.sigId = null;
            res.redirect('/petition');
        })
        .catch(err => console.log('err in deleteSignature: ', err));

});

////////////////// SIGNERS REQUESTS ////////////////
app.get('/signers', requireLoggedInUser, requireSignature, (req, res) => {

    db.getSignersInfo()
        .then(({ rows:signers }) => {

            res.render("signers", {
                layout: "main",
                signers
            });
        })
        .catch((err) => console.log("err in getSignersInfo: ", err)); 

}); // closes get request on /signers

///////////////////// SIGNERS CITY REQUESTS ///////////////
app.get('/signers/:city', requireLoggedInUser, requireSignature, (req, res) => {

    const params = req.params;
    const { city } = params;
    
    db.getSignersFromCity(city)
        .then(({ rows:rowsWithCity }) => {

            res.render('city', {
                layout: 'main',
                rowsWithCity,
                // make params accessible in the city template for puting
                // city name into the title of the page
                params
            });

        })
        .catch(err => console.log('err in getSignersFromCity: ', err));

});

/////////////////// PROFILE REQUEST ////////////////
app.get('/profile', requireLoggedInUser, requireNewUser, (req, res) => {
    // delete the cookie not to allow an 'old user' to get back to the /profile page
    req.session.newUser = null;

    res.render("profile", {
        layout: "main",
    });
});

app.post('/profile', requireLoggedInUser, (req, res) => {
    let { age, city, url } = req.body;

    const { userId } = req.session;

    db.addProfileInfo(age, city, url, userId)
        .then(() => res.redirect("/petition"))
        .catch((err) => console.log("err in addProfileInfo: ", err));
});



////////////////// LOGOUT REQUEST ///////////////
app.get('/logout', requireLoggedInUser, (req, res) => {

    req.session = null;

    res.redirect('/login');

});





//////////////////////////// EDIT-PROFILE REQUESTS ///////////////////////
app.get('/profile/edit', requireLoggedInUser, (req, res) => {

        const { userId } = req.session;

        db.getCurrUserInfo(userId)
            .then(({ rows:userInfo }) => {
                res.render('edit', {
                    layout: 'main',
                    userInfo
                });  
            })
            .catch(err => console.log('err in gerCurrUserInfo: ', err));

});

app.post('/profile/edit', requireLoggedInUser, (req, res) => {

    const { first, last, email, password, age, city, url } = req.body;

    const { userId } = req.session;

    if (!password) {
    // do the following if the user didn't update her password:
        db.updateUsersTable(first, last, email, userId)
            .then(() => {

                db.updateProfilesTable(age, city, url, userId)
                    .then(() => {
                        res.redirect('/thanks');
                    })
                    .catch(err => console.log('ERR in updateProfilesTable: ', err));

            })
            .catch(err => {
                console.log('err in updateUsersTable: ', err);

                res.render("edit-error", {
                    layout: "main"
                });

            }); // closes catch on updateUsersTable
    
    } else {
    // do the following if the user updated her password:
        bc.hash(password)
            .then((hashedPassword) => {
                db.updateUsersTableWithPassword(first, last, email, hashedPassword, userId)
                    .then(() => {
                        db.updateProfilesTable(age, city, url, userId)
                            .then(() => {
                                res.redirect("/thanks");
                            })
                            .catch((err) => {
                                console.log("ERR in updateProfilesTable: ", err);
                            });
                    })
                    .catch(err => {
                        console.log("err in updateUsersTableWithPassword: ", err);

                        res.render("edit-error", {
                            layout: "main"
                        });
                    });
            })
            .catch(err => console.log('err in hash in post on /profile/edit: ', err));

    } // closes else statement: users changes password

}); // closes post request on /profile/edit

///////////////////// DELETE REQUESTS /////////////////////
app.get('/profile/delete', requireLoggedInUser, (req, res) => {

    res.render('delete', {
        layout: 'main'
    });

});

app.post('/profile/delete', requireLoggedInUser, (req, res) => {

    db.deleteProfile(req.session.userId)
        .then(() => {
            req.session = null;
            res.redirect('/register');
        })
        .catch(err => console.log('err in deleteProfile: ', err));

});


app.listen(process.env.PORT || 8080, () =>
    console.log("my petition server is running 🚴‍♀️")
);