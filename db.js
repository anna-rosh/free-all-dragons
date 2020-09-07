const spicedPg = require('spiced-pg');

var db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

////////////// QUERIES FOR SIGNATURES TABLE ////////////
module.exports.addSignature = (first, last, sig) => {
    return db.query(
        `INSERT INTO signatures (first, last, sig)
        VALUES ($1, $2, $3)
        RETURNING id`,
        [first, last, sig]
    );
};

module.exports.countRows = () => {
    return db.query(
        `SELECT COUNT(*) FROM signatures`
    );
};

// returns only one row in .rows
module.exports.getCurrRow = (id) => {
    return db.query(
        `SELECT * FROM signatures WHERE id = $1`,
        [id]
    );
};

module.exports.getNames = () => {
    return db.query(
        `SELECT first, last FROM signatures`
    );
};


////////////// QUERIES FOR USERS TABLE ////////////
module.exports.addUser = (first, last, email, password) => {
    return db.query(
        `INSERT INTO users (first, last, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [first, last, email, password]
    );
};

module.exports.checkPassword = (email) => {
    return db.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );
};