const spicedPg = require('spiced-pg');

var db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

















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