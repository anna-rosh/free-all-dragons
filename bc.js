const bcsricpjs = require('bcryptjs');
let { genSalt, hash, compare } = bcsricpjs; // this functions are async
const { promisify } = require('util'); 

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

module.exports.compare = compare;
module.exports.hash = passwordFromUser => genSalt().then(salt => hash(passwordFromUser, salt));