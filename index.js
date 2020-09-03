const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const db = require('./db');

////////// HANDLEBARS SETTINGS /////////
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');

////////// MIDDLEWARE ////////////
app.use(express.static('./public'));


app.get('/', (req, res) => {
    res.redirect('/petition');
});

app.get('/petition', (req, res) => {
    res.render('petition', {
        layout: 'main',
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