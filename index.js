const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const db = require('./db');
const cookieSession = require('cookie-session');
const csurf = require('csurf'); // get csurf middleware to prevent csrf


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


///////////// REQUIESTS ////////////
app.get('/', (req, res) => {
    res.redirect('/petition');
});


app.get('/petition', (req, res) => {

    if (req.session.id) {
        res.redirect("/thanks");
    } else {
        res.render('petition', {
            layout: 'main',
        }); 
    }

});


app.post('/petition', (req, res) => {
    // get the user data from the request
    const { first, last, signature } = req.body;
    // use this data to create a new row in the database
    db.addSignature(first, last, signature)
        .then(({ rows }) => {

            const { id } = rows[0]; 
            // create a new id prop to store in cookies to have access to it 
            // for subsequent requiests
            req.session.id = id;
        
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


app.get('/thanks', (req, res) => {

    if (!req.session.id) {
        res.redirect('/petition');
    } else {
        // find the current id in cookies
        let currId = req.session.id;

        db.countRows()
            .then(({ rows:allRows }) => {

                db.getCurrRow(currId).then(({ rows:currRow }) => {
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


app.get('/signers', (req, res) => {

    if (!req.session.id) {
        res.redirect('/petition');
    } else {

        db.getNames()
            .then(({ rows }) => {
                res.render('signers', {
                    layout: 'main',
                    rows
                });
            })
            .catch((err) => console.log('err in getNames: ', err));
        
    } // closes else statement

}); // closes get request on /signers


app.listen(8080, () => console.log('my petition server is running 🚴‍♀️'));