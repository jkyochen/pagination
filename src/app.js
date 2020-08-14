const express = require("express");
const app = express();
const tableNames = require("./constants/tableNames");
const knex = require("./db/config");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Offset-based Pagination
app.get("/v1/blocklist", async (req, res) => {

    let page = req.query.page;
    let pageSize = req.query.pageSize;

    const blocks = await knex(tableNames.block).orderBy('height', 'desc').limit(pageSize).offset((page - 1) * pageSize);
    res.json({
        blocks: blocks,
    });
});

// Cursor-based Pagination
app.get("/v2/blocklist", async (req, res) => {

    let limit = req.query.limit;
    let before = req.query.before;
    let after = req.query.after;

    if (before && after) {
        res.json({
            code: 1000001,
            message: "before and after don't simultaneously exist"
        });
        return;
    }

    let blocks;
    if (!before && !after) {
        blocks = await knex(tableNames.block).orderBy('height', 'desc').limit(limit);
    } else if (before) {
        blocks = await knex(tableNames.block).where('height', '>', before).orderBy('height', 'asc').limit(limit);
        blocks = blocks.reverse();
    } else {
        blocks = await knex(tableNames.block).where('height', '<', after).orderBy('height', 'desc').limit(limit);
    }

    res.json({
        blocks: blocks,
    });
});

module.exports = app;
