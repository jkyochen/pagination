require("dotenv").config();

const tableNames = require("../../constants/tableNames");
const block = require("../../utils/block");

exports.seed = async (knex) => {
    await knex(tableNames.event).del();
    await knex(tableNames.block).del();

    let { newBlockHeight, txCount } = await block.create();
    console.log(`Created: ${newBlockHeight} Block, ${txCount} Event.`);
};
