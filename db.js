/* eslint-disable no-irregular-whitespace */
const spicedPg = require('spiced-pg');

const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/signatures"
);

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


///////////////// QUERIES FOR USERS, SIGNATURES, USER_PROFILES ///////////////
module.exports.getSignersInfo = () => {
    return db.query(
        `SELECT * FROM signatures
        LEFT JOIN users
        ON signatures.user_id = users.id
        LEFT JOIN user_profiles
        ON signatures.user_id = user_profiles.user_id
        `
    );

};

module.exports.getSignersFromCity = (city) => {
    return db.query(
        `SELECT users.first, users.last
        FROM signatures
        LEFT JOIN users
        ON signatures.user_id = users.id
        LEFT JOIN user_profiles
        ON signatures.user_id = user_profiles.user_id
        WHERE LOWER(city) = LOWER($1)
        `,
        [city]
    );
};

module.exports.getCurrUserInfo = (userId) => {
    return db.query(
        `SELECT * FROM users
        LEFT JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE users.id = $1
        `,
        [userId]
    );
};