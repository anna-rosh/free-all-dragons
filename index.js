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

    let body = '';
    let parsedBody;

    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        // creat an obj with input. props: first, last, signature
        parsedBody = querystring.parse(body);
        // console.log(parsedBody);
    });

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