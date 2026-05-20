// =========================================================================
//  ハンバーガーとドロワー
// =========================================================================
const button = document.querySelector("#js-button-drawer");
const drawer = document.querySelector("#js-drawer");

if (button && drawer) {
  button.addEventListener("click", function () {
  const isExpanded = button.getAttribute("aria-expanded") === "true";

  // aria属性の更新（アクセシビリティ対応）
  button.setAttribute("aria-expanded", !isExpanded);
  this.setAttribute(
    "aria-label",
    isExpanded ? "メニューを開く" : "メニューを閉じる"
  );

  // クラスの切り替えでアニメーション
  this.classList.toggle("is-checked");
  drawer.classList.toggle("is-open");
  document.body.classList.toggle("is-fixed");
});

// メニューリンクをクリックしたらドロワーを閉じる
const drawerLinks = drawer.querySelectorAll("a");
drawerLinks.forEach((link) => {
  link.addEventListener("click", () => {
    // PC表示時（ドロワーが閉じている時）は処理しない
    if (button.getAttribute("aria-expanded") === "true") {
      button.click();
    }
  });
});
}

// スクロールで画像フェードイン
const fadeTargets = document.querySelectorAll(".feature__image");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // 一度だけ発火
      }
    });
  },
  { threshold: 0.2 } // 20%見えたら発火
);

fadeTargets.forEach((target) => observer.observe(target));


// =========================================================================
//  カート機能
// =========================================================================
let cart = [];

const orderButtons = document.querySelectorAll(".button--small");
const modalOverlay = document.getElementById("js-modal-overlay");
const modalClose   = document.getElementById("js-modal-close");
const modalName    = document.getElementById("js-modal-name");
const modalPrice   = document.getElementById("js-modal-price");
const modalAdd     = document.getElementById("js-modal-add");
const qtyNum       = document.getElementById("js-qty-num");
const qtyMinus     = document.getElementById("js-qty-minus");
const qtyPlus      = document.getElementById("js-qty-plus");
const cartCount    = document.getElementById("js-cart-count");
const cartIcon     = document.getElementById("js-cart-icon");
const cartList     = document.getElementById("js-cart-list");
const cartTotal    = document.getElementById("js-cart-total");
const cartFooter   = document.getElementById("js-cart-footer");

let currentMenu = null;
let currentQty  = 1;

// モーダルを開く（HTMLから直接取得）
if (modalOverlay) {

orderButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const card  = btn.closest(".menu-card");
    const name  = card.querySelector(".menu-card__name").textContent.trim();
    
    // --- 修正ポイント：ここから ---
    // 価格の要素を取得
    const priceElement = card.querySelector(".menu-card__price");
    
    // クローン（複製）を作って、その中の <small> タグだけを消す
    const priceClone = priceElement.cloneNode(true);
    const smallTag = priceClone.querySelector("small");
    if (smallTag) {
      smallTag.remove();
    }
    
    // <small>（2人前）が消えた状態のテキストから数字だけを抽出
    const priceText = priceClone.textContent;
    const price = parseInt(priceText.replace(/[^0-9]/g, ""), 10); 
    // --- 修正ポイント：ここまで ---

    const id = btn.dataset.menuId;

    currentMenu = { id, name, price };
    currentQty  = 1;
    qtyNum.textContent     = currentQty;
    modalName.textContent  = name;
    modalPrice.textContent = `¥${price.toLocaleString()}（2人前）`;
    
    modalOverlay.classList.add("is-open");
    document.body.classList.add("is-fixed");
  });
});

// モーダルを閉じる
function closeModal() {
  modalOverlay.classList.remove("is-open");
  document.body.classList.remove("is-fixed");
}
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

// =========================================================================
//  個数変更と表示の更新
// =========================================================================
function updateModalDisplay() {
  const totalPrice = currentMenu.price * currentQty;
  const totalPeople = currentQty * 2; // 1セット2人前の場合
  modalPrice.textContent = `¥${totalPrice.toLocaleString()}（${totalPeople}人前）`;
}

// マイナスボタン
qtyMinus.addEventListener("click", () => {
  if (currentQty > 1) {
    currentQty--;
    qtyNum.textContent = currentQty;
    updateModalDisplay();
  }
});

// プラスボタン
qtyPlus.addEventListener("click", () => {
  currentQty++;
  qtyNum.textContent = currentQty;
  updateModalDisplay();
});

// =========================================================================
//  カートへの追加と更新
// =========================================================================
modalAdd.addEventListener("click", () => {
  const existing = cart.find((item) => item.id === currentMenu.id);
  
  if (existing) {
    existing.qty += currentQty;
  } else {
    cart.push({ 
      id: currentMenu.id, 
      name: currentMenu.name, 
      price: Number(currentMenu.price), 
      qty: currentQty 
    });
  }
  updateCart();
  closeModal();
});

function updateCart() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalQty;

  if (cart.length === 0) {
    cartList.innerHTML = '<p class="cart-page__empty">カートに商品がありません</p>';
    cartFooter.style.display = "none";
    return;
  }

  cartList.innerHTML = cart.map((item) => `
    <div class="cart-page__item">
      <span class="cart-page__item-name">${item.name}</span>
      <span class="cart-page__item-qty">${item.qty}個</span>
      <span class="cart-page__item-price">¥${(item.price * item.qty).toLocaleString()}</span>
      <button class="cart-page__item-remove" data-remove-id="${item.id}">削除</button>
    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotal.textContent = `¥${total.toLocaleString()}`;
  cartFooter.style.display = "flex";

  document.querySelectorAll(".cart-page__item-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.removeId;
      cart = cart.filter((item) => item.id !== id);
      updateCart();
    });
  });
}

// =========================================================================

//  カートの表示・非表示
// =========================================================================

cartIcon.addEventListener("click", () => {
  const cartSection = document.getElementById("cart");

  
  cartSection.classList.add("is-open");
  document.body.classList.add("is-fixed");
});

const cartClose = document.getElementById("js-cart-close");
if (cartClose) {
  cartClose.addEventListener("click", () => {
    document.getElementById("cart").classList.remove("is-open");
    document.body.classList.remove("is-fixed");
  });
}
}


const textarea  = document.getElementById("message");
const charCount = document.getElementById("js-char-count");
const countEl   = document.querySelector(".contact-form__count");

if (textarea) {
  textarea.addEventListener("input", () => {
    const len = textarea.value.length;
    charCount.textContent = len;
    countEl.classList.toggle("is-near", len >= 400);
  });
}