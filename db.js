const spicedPg = require('spiced-pg');

var db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

module.exports.addSignature = (first, last, sig) => {
    return db.query(
        `INSERT INTO signatures (first, last, sig)
        VALUES ($1, $2, $3)`,
        [first, last, sig]
    );
};





// module.exports.getActors = () => {
//     return db.query(`SELECT * FROM actors`);
// };

// module.exports.addActor = (name, age, oscars) => {
//     return db.query(
//         `
//         INSERT INTO actors (name, age, number_of_oscars)
//         `
//     )
// }