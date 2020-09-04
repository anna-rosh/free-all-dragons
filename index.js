const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const db = require('./db');
const cookieSession = require('cookie-session');
const querystring = require('querystring');


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

app.use(express.static('./public'));


///////////// REQUIESTS ////////////
app.get('/', (req, res) => {
    res.redirect('/petition');
});


app.get('/petition', (req, res) => {
    res.render('petition', {
        layout: 'main',
    });
});


app.post('/petition', (req, res) => {

    const { first, last, signature } = req.body;

    console.log('FIRST NAME: ', first);
    console.log('LAST NAME: ', last);
    console.log('SIGNATURE: ', signature);

});

















// app.get('/', (req, res) => {
//     console.log('get request to / route happened');
// });


// app.get('/actors', (req, res) => {
//     db.getActors()
//         .then(({ rows }) => {
//             console.log('results: ', rows);
//         })
//         .catch((err) => {
//             console.log('err in getActors: ', err);
//         });
// });

// app.get('/add-actor', (req, res) => {
//     db.addActor('Some Actor', 43, 20)
//         .then(() => {
//             console.log('that worked');
//         })
//         .catch((err) => console.log('err in assActor', err));
// });



app.listen(8080, () => console.log('my petition server is running 🚴‍♀️'));