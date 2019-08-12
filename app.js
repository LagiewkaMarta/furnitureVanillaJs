const client = contentful.createClient({
  space: "myorxwus4txn",
  accessToken: "b8j2sSIeL3RlD1Fy9mauoZGheQgOaUUgMcghmfJdp0o",
});

console.log(client)
client.getEntries().then((response) => console.log(response.items)).catch(console.error)
// client
//   .getEntry("5PeGS2SoZGSa4GuiQsigQu")
//   .then(entry => console.log(entry))
//   .catch(err => console.log(err));







// variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

let cart = [];

//getting the products
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries({
        content_type: 'furnitureProducts'
      });
      let products = contentful.items;
      return products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const { url } = item.fields.image.fields.file;
        return {
          title,
          price,
          id,
          url
        };
      });
    } catch (error) {
      console.error(error);
    }
  }
}
//displaying products
class UI {
  displayProducts(products) {
    let result = ``;
    products.forEach(({ url, id, title, price }) => {
      const product = ` <article class="product">
      <div class="img-container">
        <img
          src=${url}
          alt="product"
          class="product-img"
        />
        <button class="bag-btn" data-id=${id}>
          <i class="fas fa-shopping-cart"></i>
          add to bag
        </button>
      </div>
      <h3>${title}</h3>
      <h4>$${price}</h4>
    </article>`;
      return (result += product);
    });
    productsDOM.innerHTML = result;
  }

  getBagBtns() {
    const bagBtns = [...document.querySelectorAll(".bag-btn")];

    bagBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        btn.disabled = true;
        btn.innerText = "In Cart";
        let id = btn.dataset.id;
        let product = { ...Storage.getItemFromStorage(id), count: 1 };
        cart = [...cart, product];
        Storage.saveCartInStorage(cart);
        // add to the DOM
        this.setCartValues(cart);
        this.addCartItem(product);
        this.showCart();
      });
      this.disableBtnsIfInCArt(cart);
    });
  }

  setCartValues(cart) {
    const tempItemsCount = 0;
    const cartTotalValue = 0;
    const valuesObj = { tempItemsCount, cartTotalValue };
    let values = cart.reduce((acc, curr) => {
      acc.tempItemsCount += curr.count;
      acc.cartTotalValue += curr.price * curr.count;
      return acc;
    }, valuesObj);
    values.cartTotalValue = parseFloat(values.cartTotalValue.toFixed(2));
    cartItems.innerText = values.tempItemsCount;
    cartTotal.innerText = values.cartTotalValue;
  }

  addCartItem(item) {
    const cartItemDiv = document.createElement("div");
    cartItemDiv.classList.add("cart-item");
    cartItemDiv.innerHTML = `
    <img src=${item.url} alt="product" />
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">
        ${item.count}
      </p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    `;
    cartContent.appendChild(cartItemDiv);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  disableBtnsIfInCArt(cart) {
    const bagBtns = [...document.querySelectorAll(".bag-btn")];
    cart.forEach(item => {
      let btn = bagBtns.find(btn => btn.dataset.id === item.id);
      btn.disabled = true;
      btn.innerText = "In Cart";
    });
  }
  setUpApp() {
    cart = Storage.getCartFromStorage();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
    cartOverlay.addEventListener("click", (e) => {
      if(e.target.classList.contains("cart-overlay")){
        this.hideCart();
      }
    });
  }

  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  clearCart() {
    let cartItemsIds = cart.map(item => item.id);
    cartItemsIds.forEach(id => this.removeItem(id));
    console.log(cartContent.children);
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCartInStorage(cart);
    let btn = this.getSingleBtn(id);
    btn.disabled = false;
    btn.innerHTML = `
    <i class="fas fa-shopping-cart"></i> add to bag
    `;
  }
  getSingleBtn(id) {
    let buttons = [...document.querySelectorAll(".bag-btn")];
    let btn = buttons.find(btn => btn.dataset.id === id);
    return btn;
  }

  getItemFromTheCart(e) {
     let itemId =  e.target.dataset.id;
     let item = cart.find(item => item.id === itemId);
     return item
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", e => {
      if (e.target.classList.value === "remove-item") {
        let itemToRemove = e.target;
        let id = itemToRemove.dataset.id;
        this.removeItem(id);
        cartContent.removeChild(itemToRemove.parentElement.parentElement);
      } else if (e.target.classList.contains("fa-chevron-up")) {
        let item = this.getItemFromTheCart(e)
        item.count++;
        Storage.saveCartInStorage(cart);
        this.setCartValues(cart);
        e.target.nextElementSibling.innerText = item.count;
      } else if (e.target.classList.contains("fa-chevron-down")) {
        let itemToDecrease = e.target;
        let itemFromTheCart = this.getItemFromTheCart(e)
          if(itemFromTheCart.count > 1){
        itemFromTheCart.count--;
        Storage.saveCartInStorage(cart);
        this.setCartValues(cart);
        itemToDecrease.previousElementSibling.innerText = itemFromTheCart.count;
          } else {
            this.removeItem(itemToDecrease.dataset.id);
            cartContent.removeChild(itemToDecrease.parentElement.parentElement);
          }
      }
    });
  }
}

//local storage

class Storage {
  static saveProductsInStorage(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProductsFromStorage() {
    return JSON.parse(localStorage.getItem("products"));
  }

  static saveCartInStorage(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCartFromStorage() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }

  static getItemFromStorage(id) {
    const products = this.getProductsFromStorage();
    const product = products.find(prod => prod.id === id);
    return product;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.setUpApp();
  //get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProductsInStorage(products);
    })
    .then(products => {
      ui.getBagBtns(products);
      ui.cartLogic();
    });
});
