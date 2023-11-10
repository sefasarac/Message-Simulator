const categoryList = document.querySelector("#selected-category");
const search = document.querySelector("#search");
const searchBtn = document.querySelector("#searchBtn");
const clearBtn = document.querySelector("#clearBtn");
const categories = ["A", "B", "A-B", "NO-A-B", "All"];
const selectAll = document.querySelector("#select-all");
const checkBTN = document.querySelectorAll("#message-box");
const placeholder = document.querySelector("#data-output");
const previewMessage = document.querySelector("#preview-message-container");
const categoryCounts = [
  { key: "A", value: 4 },
  { key: "B", value: 1 },
  { key: "A-B", value: 5 },
  { key: "NO-A-B", value: 0 },
]; //{"A":4,"B":1,"A-B":5,"NO-A-B":0}
const addDataDiv = document.querySelector("#add-data");
const addCategorySelectBox = document.querySelector("#add-category");
let list = [];
let shownList = [];
let filteredData;
initiliaze();

function addMessage() {
  const message = {
    id: generateId(),
    title: document.getElementsByName("title")[0].value,
    description: document.getElementsByName("description")[0].value,
    category: document.getElementsByName("add-category")[0].value,
    datas: [],
  };
  const dataTextBoxes = document.querySelectorAll('[name^="data-"]');
  for (let tb of dataTextBoxes) {
    if (tb !== "") message.datas.push(tb.value);
  }
  list.push(message);
  fill();
}

categoryList.addEventListener("change", (event) => {
  fill(event.target.value, null);
});
searchBtn.addEventListener("click", () => {
  fill(null, search.value);
});
clearBtn.addEventListener("click", () => {
  list = [];
  placeholder.innerHTML = "";
});

function initiliaze() {
  fetch("data.json")
    .then((response) => response.json())
    .then((response) => {
      const data = response.data;
      let counter = 1;
      list = data.map((d) => {
        let obj = { ...d, id: counter++, datas: [] };
        return obj;
      });
      fill();
    });
}

function fill(categoryFilter = "All", textFilter) {
  if (!textFilter) {
    shownList =
      categoryFilter == "All"
        ? list
        : list.filter((i) => i.category === categoryFilter);
  } else {
    shownList = !textFilter
      ? list
      : list.filter((i) =>
          i.title.toLowerCase().includes(textFilter.toLowerCase())
        );
  }

  let out = "";
  for (let message of shownList) {
    out += `
        <tr>
           <td><input onchange="handleChangeChexbox(${message.id},event)" type="checkbox" name="message-box"/></td>
           <td>${message.title}</td>
           <td id="desc_${message.id}">****</td>
           <td>${message.category}</td>
        </tr>
     `;
  }
  placeholder.innerHTML = out;
  previewMessage.innerHTML = "";
}

function handleChangeChexbox(id, event) {
  toggleDescription(id, event);
  togglePreview(id, event.target.checked);
}

function togglePreview(id, checked) {
  const message = list.find((m) => m.id == id);
  if (checked === true) {
    const messageDiv = `
    <div class="mt-1" id="preview_${message.id}">
        id:${message.id} <br>
        title:${message.title} <br>
        description:${message.description} <br>
        category:${message.category} <br>
        message's:${message.datas.join(",")} <br>
        <hr>
    </div> `;
    previewMessage.innerHTML += messageDiv;
    return;
  }
  const elementDiv = document.getElementById("preview_" + message.id);
  elementDiv.remove();
}

function toggleDescription(id, event) {
  const message = list.find((m) => m.id == id);
  const td = document.querySelector("#desc_" + message.id);
  if (event.target.checked === true) {
    td.innerHTML = message.description;
    return;
  }
  td.innerHTML = "****";
}

function addDataTextBoxes(count) {
  let out = "";
  for (i = 0; i < count; i++) {
    out += '<input type="textbox" name="data-' + i + '" />';
  }
  addDataDiv.innerHTML = out;
}

function getMessagesbySearch(filter) {
  fill(null, filter);
}

selectAll.addEventListener("change", (event) => {
  const messageBoxes = document.getElementsByName("message-box");
  let checked = event.target.checked;
  for (let i = 0; i < messageBoxes.length; i++) {
    messageBoxes[i].checked = checked;
  }
  for (let i = 0; i < list.length; i++) {
    toggleDescription(list[i].id, event);
  }
  for (let i = 0; i < list.length; i++) {
    togglePreview(list[i].id, checked);
  }
});

addCategorySelectBox.addEventListener("change", (event) => {
  const value = event.target.value;
  console.log(value);
  const count = categoryCounts.find((c) => c.key == value).value;
  console.log(count);
  addDataTextBoxes(count);
});

function generateId() {
  if (!list) return 0;
  let lastId = list[list.length - 1].id;
  if (!lastId) return 0;
  return lastId + 1;
}

function exportPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.autoTable({ html: "#messages-table" });
  doc.save("table.pdf");
}
