const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const app = require("../src/app");
const knex = require("../src/db/config");

process.env.blockHeight = 20;
process.env.NODE_ENV = "test";

module.exports = { chai, app, knex };