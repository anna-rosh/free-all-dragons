const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const db = require('./db');
const cookieSession = require('cookie-session');


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
        // get the id of the row from the result obj
        // rows is one of the props of the output of addSignature containig the id
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

    let currId = req.session.id;

    db.getSigUrl(currId)
        .then(({ rows }) => {

            const { sig } = rows[0];
            
            res.render("thanks", {
                layout: "main",
                helpers: {
                    sigUrl() {
                        return sig;
                    }
                }
            });
        })
        .catch((err) => {
            console.log('err in getSigUrl: ', err);
        });

}); // closes get request on /thanks


















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