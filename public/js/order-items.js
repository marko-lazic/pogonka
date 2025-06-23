// Global flag to track if we're currently processing an add item request
let isAddingItem = false;

// Global flag to track if the page has been initialized
let isPageInitialized = false;

// Function to initialize the order items functionality
function initializeOrderItemsPage() {
    console.log('Order items script loaded and executed');

    // If the page is already initialized, don't initialize again
    if (isPageInitialized) {
        console.log('Page already initialized, skipping initialization');
        return;
    }

    // Elements
    const productSearchSelect = document.getElementById('product-search');
    const selectedProductIdInput = document.getElementById('selected-product-id');
    const itemQuantityInput = document.getElementById('item-quantity');
    const itemPriceInput = document.getElementById('item-price');
    const itemCurrencySelect = document.getElementById('item-currency');
    const addItemBtn = document.getElementById('add-item-btn');
    const orderItemsList = document.getElementById('order-items-list');
    const orderItemsData = document.getElementById('order-items-data');
    const orderTotalAmount = document.getElementById('order-total-amount');
    const orderForm = document.getElementById('create-order-form');

    // If the required elements aren't present, exit early
    if (!productSearchSelect) {
        return;
    }

    // State
    let orderItems = [];
    let selectedProduct = null;
    let nextItemId = 1;
    let tomSelect = null;

    // Initialize
    updateTotalAmount();

    // Initialize Tom Select
    if (productSearchSelect) {
        // Destroy existing instance if it exists
        if (productSearchSelect.tomselect) {
            productSearchSelect.tomselect.destroy();
        }

        tomSelect = new TomSelect(productSearchSelect, {
            valueField: 'id',
            labelField: 'name',
            searchField: ['id', 'name'],
            create: false,
            load: function(query, callback) {
                fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
                    .then(response => response.json())
                    .then(json => {
                        callback(json);
                    }).catch(() => {
                        callback();
                    });
            },
            render: {
                option: function(item, escape) {
                    return `<div class="py-2 px-3">
                        <div class="font-medium">${escape(item.name)}</div>
                        <div class="text-sm opacity-70">${escape(item.price.amount)} ${escape(item.price.currency)}</div>
                    </div>`;
                },
                item: function(item, escape) {
                    return `<div>${escape(item.name)}</div>`;
                }
            },
            onChange: function(value) {
                if (!value) {
                    selectedProduct = null;
                    selectedProductIdInput.value = '';
                    itemPriceInput.value = '';
                    return;
                }

                const option = this.options[value];
                if (option) {
                    selectedProduct = {
                        id: option.id,
                        name: option.name,
                        price: option.price.amount,
                        currency: option.price.currency
                    };

                    selectedProductIdInput.value = option.id;
                    itemPriceInput.value = option.price.amount;
                    itemCurrencySelect.value = option.price.currency;
                }
            }
        });
    }

    // If we're in edit mode, initialize the form with existing order items
    initializeOrderItems();

    // Event Listeners
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addOrderItem);
    }

    if (orderForm) {
        // Use the htmx:beforeRequest event instead of form submit
        // This ensures our function runs before HTMX sends the request
        orderForm.addEventListener('htmx:beforeRequest', function(e) {
            console.log('htmx:beforeRequest event triggered');
            if (!prepareOrderItemsForSubmission(e)) {
                e.preventDefault();
                console.log('Form submission prevented by prepareOrderItemsForSubmission');
            }
        });

        // Keep the regular submit handler as a fallback
        orderForm.addEventListener('submit', function(e) {
            console.log('Regular form submit event triggered');
            if (!prepareOrderItemsForSubmission(e)) {
                e.preventDefault();
                console.log('Form submission prevented by prepareOrderItemsForSubmission');
            }
        });
    }

    function addOrderItem() {
        // If we're already processing an add item request, don't process another one
        if (isAddingItem) {
            console.log('Already processing an add item request, ignoring duplicate call');
            return;
        }

        // Set the flag to indicate we're processing an add item request
        isAddingItem = true;

        try {
            // Check if product is selected by verifying both the selectedProduct object and the select value
            if (!selectedProduct || !selectedProductIdInput.value) {
                // Check if TomSelect has a value but selectedProduct is null (might happen during HTMX swaps)
                if (tomSelect && tomSelect.getValue() && tomSelect.options[tomSelect.getValue()]) {
                    const value = tomSelect.getValue();
                    const option = tomSelect.options[value];

                    // Check if option exists and has the necessary properties
                    if (option && option.id && option.name) {
                        // Recreate the selectedProduct object
                        // Handle both possible structures of the price property
                        if (option.price && typeof option.price === 'object' && option.price.amount && option.price.currency) {
                            // Structure: price: { amount: X, currency: Y }
                            selectedProduct = {
                                id: option.id,
                                name: option.name,
                                price: option.price.amount,
                                currency: option.price.currency
                            };

                            itemPriceInput.value = option.price.amount;
                            itemCurrencySelect.value = option.price.currency;
                        } else {
                            // Structure: price: X, currency: Y
                            // Or use default values if price/currency are not available
                            selectedProduct = {
                                id: option.id,
                                name: option.name,
                                price: option.price || 0,
                                currency: option.currency || 'EUR'
                            };

                            itemPriceInput.value = option.price || 0;
                            itemCurrencySelect.value = option.currency || 'EUR';
                        }

                        selectedProductIdInput.value = option.id;
                    } else {
                        alert('Invalid product data. Please select a product again.');
                        isAddingItem = false; // Reset the flag
                        return;
                    }
                } else {
                    alert('Please select a product');
                    isAddingItem = false; // Reset the flag
                    return;
                }
            }

            const quantity = parseInt(itemQuantityInput.value);
            if (isNaN(quantity) || quantity <= 0) {
                alert('Please enter a valid quantity');
                isAddingItem = false; // Reset the flag
                return;
            }

            const price = parseFloat(itemPriceInput.value);
            if (isNaN(price) || price < 0) {
                alert('Please enter a valid price');
                isAddingItem = false; // Reset the flag
                return;
            }

            const currency = itemCurrencySelect.value;
            // Round the total to 2 decimal places
            const total = Math.round((quantity * price) * 100) / 100;

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
            if (tomSelect) {
                tomSelect.clear();
            }
            selectedProductIdInput.value = '';
            itemQuantityInput.value = '1';
            itemPriceInput.value = '';
            selectedProduct = null;
        } finally {
            // Reset the flag regardless of success or failure
            isAddingItem = false;
        }
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

        // Set the Tom Select value
        if (tomSelect) {
            // Add the option if it doesn't exist
            if (!tomSelect.options[item.productId]) {
                tomSelect.addOption({
                    id: item.productId,
                    name: item.productName,
                    price: {
                        amount: item.price,
                        currency: item.currency
                    }
                });
            }
            tomSelect.setValue(item.productId);
        }

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
            // Round the total to 2 decimal places
            total = Math.round(total * 100) / 100;
        }

        orderTotalAmount.textContent = `${total.toFixed(2)} ${currency}`;
    }

    function prepareOrderItemsForSubmission(e) {
        console.log('Form submission started', e);
        console.log('Order items:', orderItems);
        console.log('Form action:', orderForm.getAttribute('action'));
        console.log('Form method:', orderForm.getAttribute('method'));

        // Check if we're in edit mode and no items have been added/modified
        const isEditMode = orderForm.getAttribute('action').includes('/update');
        const originalOrderItems = orderItemsData.dataset.orderItems;

        // If we're in edit mode and the orderItems array is empty, but we have original items data
        if (isEditMode && orderItems.length === 0 && originalOrderItems) {
            console.log('Edit mode with no changes to items, using original items');

            try {
                // Parse the original order items data
                const originalItems = JSON.parse(originalOrderItems);

                // Clear previous data
                orderItemsData.innerHTML = '';

                // Add hidden inputs for each original item
                if (originalItems && originalItems.length > 0) {
                    console.log(`Adding ${originalItems.length} original items to form`);

                    // Create hidden inputs for each original item
                    originalItems.forEach((item, index) => {
                        // Create the HTML for the hidden inputs
                        const inputsHtml = `
                            <input type="hidden" name="items[${index}][productId]" value="${item.productId}">
                            <input type="hidden" name="items[${index}][quantity]" value="${item.quantity}">
                            <input type="hidden" name="items[${index}][price][amount]" value="${item.price.amount || item.price}">
                            <input type="hidden" name="items[${index}][price][currency]" value="${item.price.currency || item.currency}">
                            <input type="hidden" name="items[${index}][total][amount]" value="${Math.round((item.total.amount || item.total) * 100) / 100}">
                            <input type="hidden" name="items[${index}][total][currency]" value="${item.total.currency || item.currency}">
                        `;

                        // Add the inputs to the container
                        orderItemsData.innerHTML += inputsHtml;
                    });

                    console.log('Hidden inputs for original items added to form');
                    console.log('Form HTML after adding inputs:', orderItemsData.innerHTML);
                }
            } catch (error) {
                console.error('Error processing original order items:', error);
            }

            return true;
        }

        // Clear previous data
        orderItemsData.innerHTML = '';

        // Add hidden inputs for each item if there are any
        if (orderItems.length > 0) {
            console.log(`Adding ${orderItems.length} items to form`);

            // Create hidden inputs for each item
            orderItems.forEach((item, index) => {
                // Create the HTML for the hidden inputs
                // Ensure we're using the correct format for price and total
                // They should be objects with amount and currency properties
                const inputsHtml = `
                    <input type="hidden" name="items[${index}][productId]" value="${item.productId}">
                    <input type="hidden" name="items[${index}][quantity]" value="${item.quantity}">
                    <input type="hidden" name="items[${index}][price][amount]" value="${item.price}">
                    <input type="hidden" name="items[${index}][price][currency]" value="${item.currency}">
                    <input type="hidden" name="items[${index}][total][amount]" value="${Math.round(item.total * 100) / 100}">
                    <input type="hidden" name="items[${index}][total][currency]" value="${item.currency}">
                `;

                // Add the inputs to the container
                orderItemsData.innerHTML += inputsHtml;
            });

            console.log('Hidden inputs added to form');
            console.log('Form HTML after adding inputs:', orderItemsData.innerHTML);
        }

        console.log('Form submission continuing...');
        // Return true to allow the form submission to continue
        return true;
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
                    total: Math.round(item.total.amount * 100) / 100
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

                                // Add the product to Tom Select options
                                if (tomSelect && !tomSelect.options[product.id]) {
                                    tomSelect.addOption(product);
                                }

                                // Find the item in the orderItems array and update its productName
                                const itemIndex = orderItems.findIndex(i => i.id === orderItem.id);
                                if (itemIndex !== -1) {
                                    orderItems[itemIndex].productName = product.name;
                                }

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

    // Mark the page as initialized
    isPageInitialized = true;
    console.log('Page initialization complete');
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeOrderItemsPage);

// Initialize on HTMX events (for HTMX navigation)
document.addEventListener('htmx:afterSwap', initializeOrderItemsPage);
document.addEventListener('htmx:load', initializeOrderItemsPage);
document.addEventListener('htmx:afterOnLoad', initializeOrderItemsPage);

// Add a direct call to initialize when the script loads
// This ensures initialization happens even if the events don't fire
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeOrderItemsPage, 1);
}
