// ? АПИ Для запросов
let API = "http://localhost:8000/posts";

let inp = document.querySelector(".inp");
let title = document.querySelector("#title");
let price = document.querySelector("#price");
let descr = document.querySelector("#descr");
let image = document.querySelector("#image");
let btnAdd = document.querySelector("#btn-add");

//!Inputs from modals
let editTitle = document.querySelector("#edit-title");
let editPrice = document.querySelector("#edit-price");
let editDescr = document.querySelector("#edit-descr");
let editImage = document.querySelector("#edit-image");
let editSaveBtn = document.querySelector("#btn-save-edit");
let exampleModal = document.querySelector("#exampleModal");

//! Pagination
let currentPage = 1;
let pageTotalCount = 1;
let paginationList = document.querySelector(".pagination-list");
let prev = document.querySelector(".prev");
let next = document.querySelector(".next");

//!Search
let searchInp = document.querySelector("#search");
let searchVal = "";
//? block where
let list = document.querySelector("#products-list");

// ! ADD - Обработчик событий на добавление
btnAdd.addEventListener("click", async function () {
  // собираем обьект для добавления в дб.жсон
  let obj = {
    title: title.value,
    price: price.value,
    descr: descr.value,
    image: image.value,
  };

  // проверим - создается ли он
  console.log(obj);

  if (
    !obj.title.trim() ||
    !obj.price.trim() ||
    !obj.descr.trim() ||
    !obj.image.trim()
  ) {
    alert("Заполните все поля");
    return;
  }

  // ! запрос на добавление
  await fetch(API, {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-type": "application/json",
    },
  });

  title.value = "";
  price.value = "";
  descr.value = "";
  image.value = "";
  render();
});

//! Viewing from json-server

async function render() {
  let products = await fetch(
    `${API}?q=${searchVal}&_page=${currentPage}&_limit=3`
  )
    .then((res) => res.json())
    .catch((err) => console.log(err));
  drawPaginationButtons();

  //!catch an error
  console.log(products);
  list.innerHTML = "";
  products.forEach((element) => {
    console.log(element);
    let newElem = document.createElement("div");
    newElem.id = element.id;
    newElem.innerHTML = `
    <div class="card m-5" style="width: 18rem;">
    <img src=${element.image} class="card-img-top" alt="...">
    <div class="card-body">
      <h5 class="card-title">${element.title}</h5>
      <p class="card-text">${element.descr}</p>
      <p class="card-text">$ ${element.price}</p>
      <a href="#" id=${element.id} class="btn btn-danger btn-delete">DELETE</a>
      <a href="#" data-bs-toggle="modal" data-bs-target="#exampleModal" id=${element.id} class="btn btn-dark btn-edit">EDIT</a>
    </div>
  </div>`;
    list.append(newElem);
  });
}

render();

//! Removing card from DB

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-delete")) {
    let id = e.target.id;

    await fetch(`${API}/${id}`, { method: "DELETE" });
    render();
  }
});

//!Editing a product
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-edit")) {
    let id = e.target.id;
    fetch(`${API}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        editTitle.value = data.title;
        editPrice.value = data.price;
        editDescr.value = data.descr;
        editImage.value = data.image;
        editSaveBtn.setAttribute("id", data.id);
      });
  }
});

//!
editSaveBtn.addEventListener("click", function (e) {
  let id = this.id;
  let title = editTitle.value;
  let price = editPrice.value;
  let descr = editDescr.value;
  let image = editImage.value;

  if (!title || !descr || !image || !price) {
    return;
  }
  let editProduct = {
    title: title,
    price: price,
    descr: descr,
    image: image,
  };
  saveEdit(editProduct, id);
});

//! function to request to save
function saveEdit(editedProduct, id) {
  fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(editedProduct),
  }).then(() => {
    render();
  });
  let modal = bootstrap.Modal.getInstance(exampleModal);
  modal.hide();
}

// todo PAGINATION
function drawPaginationButtons() {
  fetch(`${API}?q=${searchVal}`)
    .then((res) => res.json())
    .then((data) => {
      pageTotalCount = Math.ceil(data.length / 3);
      // общее количество продуктов делим на кол-во продуктов которые отображаются на одной странице
      //pageTotalCount = кол-во страниц
      paginationList.innerHTML = "";
      for (let i = 1; i <= pageTotalCount; i++) {
        // создаем кнопки с цифрами
        if (currentPage == i) {
          let page1 = document.createElement("li");
          page1.innerHTML = `<li class="page-item active">
          <a class="page-link page_number" href="#">${i}</a>
      </li>
  `;
          paginationList.append(page1);
        } else {
          let page2 = document.createElement("li");
          page2.innerHTML = `<li class="page-item ">
          <a class="page-link page_number" href="#">${i}</a>
      </li>
  `;
          paginationList.append(page2);
        }
      }
      if (currentPage == 1) {
        prev.classList.add("disabled");
      } else {
        prev.classList.remove("disabled");
      }
      if (currentPage == pageTotalCount) {
        next.classList.add("disabled");
      } else {
        next.classList.remove("disabled");
      }
    });
}

prev.addEventListener("click", () => {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  render();
});
next.addEventListener("click", () => {
  if (currentPage >= pageTotalCount) {
    return;
  }
  currentPage++;
  render();
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("page_number")) {
    currentPage = e.target.innerText;
    render();
  }
});
drawPaginationButtons();

//! TODO SEARCH

searchInp.addEventListener("input", () => {
  //? writes the value of search bar in variable searchVal;
  searchVal = searchInp.value;
  currentPage = 1;
  render();
});
