require("dotenv").config();

const { chai, app, knex } = require(".");

let blockHeight = Number(process.env.blockHeight);

describe("test mock node", () => {
    beforeAll(async () => {
        await knex.migrate.rollback();
        await knex.migrate.latest();
        await knex.seed.run();
    });

    afterAll(async () => {
        await knex.migrate.rollback();
    });

    describe("GET Offset-based Pagination", () => {
        test("Should return homepage data", async () => {
            const pagination = {
                page: 1,
                pageSize: 5,
            }
            const res = await chai.request(app).get(`/v1/blocklist?page=${pagination.page}&pageSize=${pagination.pageSize}`);
            expect(res.status).toEqual(200);
            expect(res.body.blocks.length).toEqual(pagination.pageSize);
            expect(res.body.blocks[0].height).toEqual(blockHeight);
            expect(res.body.blocks[res.body.blocks.length - 1].height).toEqual(blockHeight - 4);
        });

        test("Should return next page", async () => {
            const pagination = {
                page: 2,
                pageSize: 5,
            }
            const res = await chai.request(app).get(`/v1/blocklist?page=${pagination.page}&pageSize=${pagination.pageSize}`);
            expect(res.status).toEqual(200);
            expect(res.body.blocks.length).toEqual(pagination.pageSize);

            let curHeight = blockHeight - (pagination.page - 1) * pagination.pageSize;
            expect(res.body.blocks[0].height).toEqual(curHeight);
            expect(res.body.blocks[res.body.blocks.length - 1].height).toEqual(curHeight - 4);
        });
    });

    describe("GET Cursor-based Pagination", () => {
        test("Should return homepage data", async () => {
            const pagination = {
                limit: 5,
            }
            const res = await chai.request(app).get(`/v2/blocklist?limit=${pagination.limit}`);
            expect(res.status).toEqual(200);
            expect(res.body.blocks.length).toEqual(pagination.limit);
            expect(res.body.blocks[0].height).toEqual(blockHeight);
            expect(res.body.blocks[res.body.blocks.length - 1].height).toEqual(blockHeight - 4);
        });

        test("Should return next page", async () => {
            const pagination = {
                limit: 5,
                after: 10,
            }
            const res = await chai.request(app).get(`/v2/blocklist?limit=${pagination.limit}&after=${pagination.after}`);
            expect(res.status).toEqual(200);
            expect(res.body.blocks.length).toEqual(pagination.limit);

            let curAfterCursorHeight = pagination.after;
            expect(res.body.blocks[0].height).toEqual(curAfterCursorHeight - 1);
            expect(res.body.blocks[res.body.blocks.length - 1].height).toEqual(curAfterCursorHeight - pagination.limit);
        });

        test("Should return prev page", async () => {
            const pagination = {
                limit: 5,
                before: 10,
            }
            const res = await chai.request(app).get(`/v2/blocklist?limit=${pagination.limit}&before=${pagination.before}`);
            expect(res.status).toEqual(200);
            expect(res.body.blocks.length).toEqual(pagination.limit);

            let curBeforeCursorHeight = pagination.before;
            expect(res.body.blocks[0].height).toEqual(curBeforeCursorHeight + 5);
            expect(res.body.blocks[res.body.blocks.length - 1].height).toEqual(curBeforeCursorHeight + 1);
        });
    });
});
