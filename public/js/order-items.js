document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const productSearchInput = document.getElementById('product-search');
    const productSearchResults = document.getElementById('product-search-results');
    const selectedProductIdInput = document.getElementById('selected-product-id');
    const itemQuantityInput = document.getElementById('item-quantity');
    const itemPriceInput = document.getElementById('item-price');
    const itemCurrencySelect = document.getElementById('item-currency');
    const addItemBtn = document.getElementById('add-item-btn');
    const orderItemsList = document.getElementById('order-items-list');
    const orderItemsData = document.getElementById('order-items-data');
    const orderTotalAmount = document.getElementById('order-total-amount');
    const orderForm = document.getElementById('create-order-form');

    // State
    let orderItems = [];
    let selectedProduct = null;
    let nextItemId = 1;

    // Initialize
    updateTotalAmount();

    // If we're in edit mode, initialize the form with existing order items
    initializeOrderItems();

    // Event Listeners
    if (productSearchInput) {
        productSearchInput.addEventListener('focus', function() {
            if (productSearchResults.children.length > 0) {
                productSearchResults.classList.remove('hidden');
            }
        });

        document.addEventListener('click', function(e) {
            if (!productSearchInput.contains(e.target) && !productSearchResults.contains(e.target)) {
                productSearchResults.classList.add('hidden');
            }
        });

        // Custom event for when search results are loaded
        productSearchInput.addEventListener('htmx:afterSwap', function() {
            setupSearchResults();
        });
    }

    if (addItemBtn) {
        addItemBtn.addEventListener('click', addOrderItem);
    }

    if (orderForm) {
        orderForm.addEventListener('submit', prepareOrderItemsForSubmission);
    }

    // Functions
    function setupSearchResults() {
        productSearchResults.classList.remove('hidden');
        const resultItems = productSearchResults.querySelectorAll('a');

        resultItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.dataset.productId;
                const productName = this.textContent.trim();
                const productPrice = parseFloat(this.dataset.productPrice || 0);
                const productCurrency = this.dataset.productCurrency || 'EUR';

                selectedProduct = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    currency: productCurrency
                };

                productSearchInput.value = productName;
                selectedProductIdInput.value = productId;
                itemPriceInput.value = productPrice;
                itemCurrencySelect.value = productCurrency;

                productSearchResults.classList.add('hidden');
            });
        });
    }

    function addOrderItem() {
        if (!selectedProduct) {
            alert('Please select a product');
            return;
        }

        const quantity = parseInt(itemQuantityInput.value);
        if (isNaN(quantity) || quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        const price = parseFloat(itemPriceInput.value);
        if (isNaN(price) || price < 0) {
            alert('Please enter a valid price');
            return;
        }

        const currency = itemCurrencySelect.value;
        const total = quantity * price;

        const itemId = `item-${nextItemId++}`;

        const newItem = {
            id: itemId,
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            quantity: quantity,
            price: price,
            currency: currency,
            total: total
        };

        orderItems.push(newItem);
        renderOrderItems();
        updateTotalAmount();

        // Reset form
        productSearchInput.value = '';
        selectedProductIdInput.value = '';
        itemQuantityInput.value = '1';
        itemPriceInput.value = '';
        selectedProduct = null;
    }

    function renderOrderItems() {
        orderItemsList.innerHTML = '';

        orderItems.forEach(item => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toFixed(2)} ${item.currency}</td>
                <td>${item.total.toFixed(2)} ${item.currency}</td>
                <td>
                    <div class="dropdown dropdown-end">
                        <label tabindex="0" class="btn btn-sm btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                        </label>
                        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                            <li><a href="#" class="edit-item" data-item-id="${item.id}">Edit</a></li>
                            <li><a href="#" class="remove-item" data-item-id="${item.id}">Remove</a></li>
                        </ul>
                    </div>
                </td>
            `;

            orderItemsList.appendChild(row);
        });

        // Add event listeners to edit and remove buttons
        document.querySelectorAll('.edit-item').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                editOrderItem(this.dataset.itemId);
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                removeOrderItem(this.dataset.itemId);
            });
        });
    }

    function editOrderItem(itemId) {
        const item = orderItems.find(item => item.id === itemId);
        if (!item) return;

        selectedProduct = {
            id: item.productId,
            name: item.productName,
            price: item.price,
            currency: item.currency
        };

        productSearchInput.value = item.productName;
        selectedProductIdInput.value = item.productId;
        itemQuantityInput.value = item.quantity;
        itemPriceInput.value = item.price;
        itemCurrencySelect.value = item.currency;

        // Remove the item from the list
        removeOrderItem(itemId);
    }

    function removeOrderItem(itemId) {
        orderItems = orderItems.filter(item => item.id !== itemId);
        renderOrderItems();
        updateTotalAmount();
    }

    function updateTotalAmount() {
        let total = 0;
        let currency = 'EUR';

        if (orderItems.length > 0) {
            // For simplicity, we're assuming all items have the same currency
            currency = orderItems[0].currency;
            total = orderItems.reduce((sum, item) => sum + item.total, 0);
        }

        orderTotalAmount.textContent = `${total.toFixed(2)} ${currency}`;
    }

    function prepareOrderItemsForSubmission(e) {
        // Clear previous data
        orderItemsData.innerHTML = '';

        // If no items, show an alert and prevent submission
        if (orderItems.length === 0) {
            alert('Please add at least one item to the order');
            e.preventDefault();
            return;
        }

        // Add hidden inputs for each item
        orderItems.forEach((item, index) => {
            orderItemsData.innerHTML += `
                <input type="hidden" name="items[${index}][productId]" value="${item.productId}">
                <input type="hidden" name="items[${index}][quantity]" value="${item.quantity}">
                <input type="hidden" name="items[${index}][price]" value="${item.price}">
                <input type="hidden" name="items[${index}][currency]" value="${item.currency}">
            `;
        });
    }

    function initializeOrderItems() {
        // Check if we're in edit mode by looking for a data attribute on the form
        const orderItemsData = document.getElementById('order-items-data');
        if (!orderItemsData || !orderItemsData.dataset.orderItems) {
            return; // Not in edit mode or no order items data
        }

        try {
            // Parse the order items data from the data attribute
            const items = JSON.parse(orderItemsData.dataset.orderItems);

            // Add each item to the order items list
            items.forEach(item => {
                // Generate a unique ID for the item
                const itemId = `item-${nextItemId++}`;

                // Create an order item object
                const orderItem = {
                    id: itemId,
                    productId: item.productId,
                    productName: `Product ${item.productId}`, // Temporary name
                    quantity: item.quantity,
                    price: item.price.amount,
                    currency: item.price.currency,
                    total: item.total.amount
                };

                // Fetch product name if not available
                fetch(`/api/products/search?q=${item.productId}`)
                    .then(response => response.json())
                    .then(products => {
                        if (products && products.length > 0) {
                            // Find the product with matching ID
                            const product = products.find(p => p.id === item.productId);
                            if (product) {
                                // Update the product name in the order item
                                orderItem.productName = product.name;
                                // Re-render the order items to show the updated name
                                renderOrderItems();
                            }
                        }
                    })
                    .catch(error => console.error('Error fetching product:', error));

                // Add the item to the order items list
                orderItems.push(orderItem);
            });

            // Render the order items
            renderOrderItems();
            updateTotalAmount();
        } catch (error) {
            console.error('Error initializing order items:', error);
        }
    }
});
