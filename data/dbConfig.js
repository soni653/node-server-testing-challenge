const knex = require("knex");
const knexFile = require("../knexfile");
//const environment = process.env.NODE_ENV || knexFile.development;
module.exports = knex(knexFile.development);
