async function getData(url) {
    return await ky.get(url).json();
}

function render(blocks, direction = "afterbegin") {
    let lists = [];
    blocks.forEach((r, i) => {
        if (i !== blocks.length - 1) {
            lists.push(`<li class="list-group-item">${r.height}</li>`);
            return;
        }
        lists.push(`<li class="list-group-item block-item">${r.height}</li>`);
    });
    // document.getElementsByClassName("list-group")[0].insertAdjacentHTML(direction, lists.join(""));
    $(".list-group").append(lists);
}
