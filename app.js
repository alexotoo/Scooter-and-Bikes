console.log(client);
//DOM string variables selection
const cartBtn = document.querySelector(".cart-btn");
const closcartBtn = document.querySelector(".close-cart");
const clearcartBtn = document.querySelector(".clear-cart");
const cartMain = document.querySelector(".cart");
const cartMainOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const ProductsDOM = document.querySelector(".products-center");

//cart array
let cart = [];

//button
let buttonsDOM = [];

// Products class
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries();
      console.log(contentful.items);

      let products = contentful.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      // console.log(products);
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// UI display class
class UI {
  renderProducts(products) {
    console.log(products);

    let result = "";
    products.forEach((product) => {
      result += `
           <article class="product">
          <div class="img-container">
            <img height="720" width="1280"
              src="${product.image}"
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>${product.price}</h4>
        </article>

       `;
    });
    ProductsDOM.innerHTML = result;
  }
  getItemButton() {
    const buttons = [...document.querySelectorAll(".bag-btn")];

    buttonsDOM = buttons;

    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.style.backgroundColor = "red";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.style.backgroundColor = "red";
        event.target.disabled = true;

        //get product from products in storage
        let cartItem = { ...Storage.getProductLocalS(id), units: 1 };
        console.log(cartItem);

        //product to cart
        cart = [...cart, cartItem];
        console.log(cart);

        //save cart to localStorage
        Storage.saveCartLocalS(cart);

        //set cart values
        this.setCartValues(cart);

        //render cart item
        this.renderCartItem(cartItem);
        //display cart items
        this.displayCartItem();
      });
    });
  }
  setCartValues(cart) {
    let slectedProTotal = 0,
      slectedProTotalUnits = 0;
    cart.map((pro) => {
      slectedProTotal += pro.price * pro.units;
      slectedProTotalUnits += pro.units;
    });
    cartTotal.innerText = parseFloat(slectedProTotal.toFixed(2));
    cartItems.innerText = slectedProTotalUnits;
  }
  renderCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src=${item.image} alt="product" />
      <div>
        <h4>${item.title}</h4>
        <h5>${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>remove</span>
      </div>
      <div>
        <i class="fas fa-chevron-up"data-id=${item.id}></i>
        <p class="item-amount">${item.units}</p>
        <i class="fas fa-chevron-down"data-id=${item.id}></i>
      </div>
    `;
    cartContent.appendChild(div);
    console.log(cartContent);
  }
  displayCartItem() {
    cartMainOverlay.classList.add("transparentBcg");
    cartMain.classList.add("showCart");
  }

  setupApp() {
    cart = Storage.getCartLocalS();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.displayCartItem);
    closcartBtn.addEventListener("click", this.hideCart);
  }

  hideCart() {
    cartMainOverlay.classList.remove("transparentBcg");
    cartMain.classList.remove("showCart");
  }
  populateCart(cart) {
    cart.forEach((item) => this.renderCartItem(item));
  }

  cartLogic() {
    clearcartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addUnit = event.target;
        let id = addUnit.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.units = tempItem.units + 1;
        Storage.saveCartLocalS(cart);
        this.setCartValues(cart);
        addUnit.nextElementSibling.innerText = tempItem.units;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lessUnit = event.target;
        let id = lessUnit.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        if (tempItem.units > 0) {
          tempItem.units = tempItem.units - 1;
          Storage.saveCartLocalS(cart);
          this.setCartValues(cart);
          lessUnit.previousElementSibling.innerText = tempItem.units;
        } else {
          cartContent.removeChild(lessUnit.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCartLocalS(cart);
    let button = this.getOneButton(id);
    button.disabled = false;
    button.style.backgroundColor = "#c4985f";
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }
  getOneButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

// Storage class
class Storage {
  static saveProductsLocalS(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProductLocalS(id) {
    let products = JSON.parse(localStorage.getItem("products"));

    console.log(products);
    return products.find((product) => product.id === id);
  }
  static saveCartLocalS(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCartLocalS() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  // initialize App
  ui.setupApp();
  //get data
  products
    .getProducts()
    .then((products) => {
      ui.renderProducts(products);
      Storage.saveProductsLocalS(products);
    })
    .then(() => {
      ui.getItemButton();
      ui.cartLogic();
    });
});
