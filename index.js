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


////////////////////////// ROOT ROUTE REQUESTS ///////////////////////
app.get('/', (req, res) => {
    res.redirect('/petition');
});

///////////////////////// PETITION REQUESTS //////////////////////////
app.get('/petition', (req, res) => {

    if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        res.render('petition', {
            layout: 'main',
        }); 
    }

});


app.post('/petition', (req, res) => {
    // get the user data from the request
    const { signature } = req.body;
    // get the users.id from the cookie to store it in signatures table
    const { userId } = req.session;
    // use this data to create a new row in the database
    db.addSignature(signature, userId)
        .then(({ rows }) => {

            const { id } = rows[0]; 
            // create a new id prop to store in cookies to have access to it 
            // for subsequent requiests
            // req.session.sigId = id;
        
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
app.get('/thanks', (req, res) => {

    if (!req.session.sigId) {
        res.redirect('/petition');
    } else {
        // find the current id in cookies
        let currSigId = req.session.sigId;

        db.countRows()
            .then(({ rows:allRows }) => {

                db.getCurrRow(currSigId).then(({ rows:currRow }) => {
                    res.render('thanks', {
                        layout: 'main',
                        currRow,
                        allRows
                    });
                }).catch(err => console.log('error in getSigUrl: ', err)); // catch for getSigUrl

            })
            .catch((err) => {
                console.log('err in getSigUrl: ', err);
            }); // catch for countRows
    } // closes else statement

}); // closes get request on /thanks

////////////////// SIGNERS REQUESTS ////////////////
app.get('/signers', (req, res) => {

    if (!req.session.sigId) {
        res.redirect('/petition');
    } else {

        db.getNames()        // THIS FUNCTION NEEDS TO BE FIXED TO GET USER'S INFO FROM OTHER TABLES!!!!
            .then(({ rows }) => {
                res.render('signers', {
                    layout: 'main',
                    rows
                });
            })
            .catch((err) => console.log('err in getNames: ', err));
        
    } // closes else statement

}); // closes get request on /signers

////////////////// REGISTER REQUESTS //////////////////
app.get('/register', (req, res) => {

    res.render('register', {
        layout: 'main'
    });

});



app.post('/register', (req, res) => {

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
app.get('/login', (req, res) => {

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

            bc.compare(password, encodedPassword)
                .then((result) => {

                    if (result == true) {
                        // place user's id in the cookie to define her as logged in
                        req.session.userId = id;
                        // check if the user has signed the petition
                        if(req.session.sigId) {
                            res.redirect('/thanks');
                        } else {
                            res.redirect('/petition');
                        }
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

////////////////// LOGGED OUT REQUEST ///////////////
app.get('/logout', (req, res) => {

    req.session = null;

    res.render('logout', {
        layout: 'main'
    });

});


/////////////////// PROFILE REQUEST ////////////////
app.get('/profile', (req, res) => {

    res.render('profile', {
        layout: 'main',
    });

});

app.post('/profile', (req, res) => {

    const { age, city, url } =  req.body;
    const { userId } = req.session;

    db.addProfileInfo(age, city, url, userId)
        .then(() => res.redirect('/petition'))
        .catch(err => console.log('err in addProfileInfo: ', err));

});


app.listen(8080, () => console.log('my petition server is running 🚴‍♀️'));