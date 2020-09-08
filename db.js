/* eslint-disable no-irregular-whitespace */
const spicedPg = require('spiced-pg');

var db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

////////////// QUERIES FOR SIGNATURES TABLE ////////////
module.exports.addSignature = (sig, userId) => {
    return db.query(
        `INSERT INTO signatures (sig, user_id)
        VALUES ($1, $2)
        RETURNING id`,
        [sig, userId]
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

module.exports.getNames = () => { // THIS FUNCTION NEEDS TO BE CHANGED TO GET USER'S INFORMATION FROM OTHER TABLES
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



////////////// QUERIES FOR USER_PROFILES TABLE /////////////
module.exports.addProfileInfo = (age, city, url, userId) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        `,
        [age || null, city || null, url || null, userId]
    );
};