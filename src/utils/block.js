require("dotenv").config();

const sha256 = require("bcrypto/lib/sha256");
const { v4: uuidv4 } = require("uuid");
const knex = require("../db/config");
const tableNames = require("../constants/tableNames");

function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function sha256ToString(o) {
    return sha256.digest(Buffer.from(JSON.stringify(o))).toString("hex");
}

module.exports = {
    create: async function (diffBlockHeight = 0) {
        let txCount = 0;

        let init_height = 0;
        let blockHeight = Number(process.env.blockHeight);
        let previousBlockHash =
            "0000000000000000000000000000000000000000000000000000000000000000";
        const [maxBlock] = await knex(tableNames.block)
            .orderBy("height", "desc")
            .limit(1);
        if (maxBlock) {
            init_height = maxBlock.height + 1;
            blockHeight = init_height + diffBlockHeight;
            previousBlockHash = maxBlock.hash;
        }

        if (init_height >= blockHeight) {
            return 0;
        }

        for (let h = init_height; h < blockHeight; h++) {
            let block = {
                height: h,
                timestamp: Date.now(),
                previousBlockHash: previousBlockHash,
            };

            let coinbase = {
                height: h,
                sender: "00",
                recipient: uuidv4().split("-").join(""),
                amount: 5,
            };
            coinbase.hash = sha256ToString(coinbase);

            let txs = [coinbase];
            for (let j = 0; j < getRandomArbitrary(0, 5); j++) {
                let tx = {
                    height: h,
                    sender: uuidv4().split("-").join(""),
                    recipient: uuidv4().split("-").join(""),
                    amount: getRandomArbitrary(1, 50),
                };
                tx.hash = sha256ToString(tx);
                txs.push(tx);
            }
            block.txs = txs;
            block.txsNumber = txs.length;

            block.hash = sha256ToString(block);
            block.nonce = 0; // TODO

            delete block.txs;
            const [block_id] = await knex(tableNames.block).insert(block);

            txs.forEach(async (t) => {
                await knex(tableNames.event).insert({
                    ...t,
                    block_id: block_id,
                });
            });
            txCount += txs.length;
        }

        return {
            txCount,
            diffBlockHeight: blockHeight - init_height,
        };
    },
    triggerCreateBlockInDevelopment: async function (diffHeight = getRandomArbitrary(3, 8)) {

        if (process.env.NODE_ENV !== "development") {
            return;
        }

        let { diffBlockHeight, txCount } = await this.create(diffHeight);
        console.log(`Created: ${diffBlockHeight} Block, ${txCount} Event.`);
    },
};
