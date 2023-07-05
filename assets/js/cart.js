var Cart = {
    deliveryPrice: 0,
    deliveryType: null,
    deliveryDetails: {},
    get: function() {
        try {
            return JSON.parse(localStorage.getItem('cart')) || {};
        } catch {
            return {};
        }
    },
    set: function(cart) {
        localStorage['cart'] = JSON.stringify(cart)
        Cart.render()
    },
    clear: function() {
        sessionStorage.removeItem('cart')
    },
    add: function(item, quantity = 1) {
        const cart = Cart.get()
        const id = item.id
        if (id in cart) {
            cart[id].quantity += quantity
        } else {
            cart[id] = {
                item: item,
                quantity: quantity
            }
        }
        Cart.set(cart)
    },
    update: function(id, quantity = 1) {
        let cart = Cart.get()
        if (id in cart) {
            if (quantity > 0) {
                cart[id].quantity = quantity
            } else {
                delete cart[id]
            }
            Cart.set(cart)
        }
    },
    remove: function(id) {
        let cart = Cart.get()
        if (id in cart) {
            delete cart[id]
            Cart.set(cart)
        }
    },
    subtotal: function() {
        const cart = Cart.get()
        return total = Object.values(cart).reduce(
            (sum, item) => sum + item.quantity * item.item.price,
            0
        )
    },
    total: function() {
        return Cart.subtotal() + Cart.deliveryPrice
    },
    render: function() {
        const cart = Cart.get()

        const badge = document.querySelector(".cart .cart-items-count")
        if (badge) {
            const item_count = Object.values(cart).reduce(
                (sum, item) => sum + item.quantity,
                0
            )
            badge.innerHTML = item_count || ""
        }

        const cart_summary = document.querySelector('#cart-summary')
        if (cart_summary) {
            const template = document.querySelector('#cart-summary-template[type="text/template"]')
            const engine = new liquidjs.Liquid({
              outputDelimiterLeft: '[=',
              outputDelimiterRight: '=]',
              tagDelimiterLeft: '[[',
              tagDelimiterRight: ']]',
            })

            const items = Object.values(cart).map(item => ({
                id: item.item.id,
                price: Cart.currencyFormat.format(item.item.price / 100),
                quantity: item.quantity,
                subtotal: Cart.currencyFormat.format(item.item.price / 100 * item.quantity),
                name: item.item.name,
                description: item.item.description,
                url: item.item.url,
                image: item.item.image,
                instock: item.item.instock,
            }))

            engine
                .parseAndRender(template.innerHTML, {
                    items: items,
                    deliveryPrice: Cart.currencyFormat.format(Cart.deliveryPrice / 100),
                    subtotal: Cart.currencyFormat.format(Cart.subtotal() / 100),
                    total: Cart.currencyFormat.format(Cart.total() / 100),
                })
                .then(html => cart_summary.innerHTML = html)

        }
    },
    setHandlers: function() {
        const buttons = document.querySelectorAll(".cart-add-item")
        for (const button of buttons) {
            button.onclick = function(e) {
                const item = e.target.dataset
                let cartitem = {}
                for (const key in item) {
                    if (key.startsWith("item")) {
                        const name = key.replace("item", "").toLowerCase()
                        cartitem[name] = item[key]
                    }
                }
                cartitem["price"] = Math.floor(parseFloat(cartitem["price"]) * 100)
                Cart.add(cartitem)
            }
        }
    }
}

Cart.currencyFormat = (function(Cart) {
    Cart.currency = 'EUR'
    const cartCurrency = document.querySelector("[data-cart-currency]")
    if (cartCurrency) {
        Cart.currency = cartCurrency.dataset.cartCurrency
    }
    return new Intl.NumberFormat(
        document.documentElement.lang, {
            style: 'currency',
            currency: Cart.currency
        }
    )

})(Cart)
Cart.setHandlers()
Cart.render()
