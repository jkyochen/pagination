let pagination = {};

async function getBlockListData({ before, after } = {}) {
    const data = await ky.get(`/v2/blocklist?limit=5&before=${before || ""}&after=${after || ""}`).json();
    let lists = [];
    data.blocks.forEach(r => {
        lists.push(`<li class="list-group-item">${r.height}</li>`);
    });
    document.getElementsByClassName("list-group")[0].insertAdjacentHTML("afterbegin", lists.join(""));
    if (data.blocks.length) {
        if (!before && !after) {
            pagination.before = data.blocks[0].height;
            pagination.after = data.blocks[data.blocks.length - 1].height;
        }
        if (before) {
            pagination.before = data.blocks[0].height;
        }
        if (after) {
            pagination.after = data.blocks[data.blocks.length - 1].height;
        }
    }
}

(async function () {
    await getBlockListData();
})();

const ptr = PullToRefresh.init({
    mainElement: 'body',
    async onRefresh() {
        await getBlockListData({
            before: pagination.before
        });
    },
});
