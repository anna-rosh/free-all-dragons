const spicedPg = require('spiced-pg');

var db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

module.exports.addSignature = (first, last, sig) => {
    return db.query(
        `INSERT INTO signatures (first, last, sig)
        VALUES ($1, $2, $3)
        RETURNING id`,
        [first, last, sig]
    );
};

module.exports.getSigUrl = (id) => {
    return db.query(
        `SELECT * FROM signatures WHERE id = $1`,
        [id]
    );
};

module.exports.countRows = () => {
    return db.query(
        `SELECT COUNT(*) FROM signatures`
    );
};