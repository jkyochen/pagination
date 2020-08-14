
let offsetPagination = new Request('/v1/blocklist?page=1&pageSize=10');

fetch(offsetPagination).then(function (response) {
    if (response.status === 200) {
        return response.json();
    } else {
        throw new Error('Something went wrong on api server!');
    }
}).then(function (data) {
    data.blocks.forEach(r => {
        document.getElementsByClassName("list-group")[0].insertAdjacentHTML("beforeend", `<button type="button" class="list-group-item list-group-item-action">${r.height}</button>`);
    });
});

const ptr = PullToRefresh.init({
    mainElement: 'body',
    onRefresh() {
        window.location.reload();
    },
});
