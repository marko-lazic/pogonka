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
    let autocompleterInstance = null;

    // Initialize
    updateTotalAmount();

    // Initialize Autocompleter
    if (productSearchSelect) {
        const productSuggestions = document.getElementById('product-suggestions');
        
        if (productSuggestions) {
            // Initialize autocompleter
            initializeAutocompleter(productSearchSelect, productSuggestions);
        }
    }

    // If we're in edit mode, initialize the form with existing order items
    initializeOrderItems();

    function initializeAutocompleter(input, suggestionsContainer) {
        let searchTimeout;
        let currentProducts = [];
        let selectedIndex = -1;

        function showSuggestions(products) {
            currentProducts = products;
            selectedIndex = -1;
            
            if (products.length === 0) {
                suggestionsContainer.classList.add('hidden');
                return;
            }

            suggestionsContainer.innerHTML = '';
            
            products.forEach((product, index) => {
                const suggestion = document.createElement('div');
                suggestion.className = 'p-3 cursor-pointer hover:bg-base-200 border-b border-base-300 last:border-b-0';
                suggestion.innerHTML = `
                    <div class="font-medium text-base-content">${escapeHtml(product.name)}</div>
                    <div class="text-sm text-base-content/70">${escapeHtml(product.price.amount)} ${escapeHtml(product.price.currency)}</div>
                `;
                
                suggestion.addEventListener('click', () => {
                    selectProduct(product);
                });

                suggestionsContainer.appendChild(suggestion);
            });

            suggestionsContainer.classList.remove('hidden');
        }

        function hideSuggestions() {
            suggestionsContainer.classList.add('hidden');
            currentProducts = [];
            selectedIndex = -1;
        }

        function selectProduct(product) {
            selectedProduct = {
                id: product.id,
                name: product.name,
                price: product.price.amount,
                currency: product.price.currency
            };

            input.value = product.name;
            selectedProductIdInput.value = product.id;
            itemPriceInput.value = product.price.amount;
            itemCurrencySelect.value = product.price.currency;
            
            hideSuggestions();
        }

        function highlightSuggestion(index) {
            const suggestions = suggestionsContainer.querySelectorAll('div[class*="p-3"]');
            suggestions.forEach((suggestion, i) => {
                if (i === index) {
                    suggestion.classList.add('bg-primary', 'text-primary-content');
                    suggestion.classList.remove('hover:bg-base-200');
                } else {
                    suggestion.classList.remove('bg-primary', 'text-primary-content');
                    suggestion.classList.add('hover:bg-base-200');
                }
            });
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Input event handler
        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(searchTimeout);
            
            if (query.length < 2) {
                hideSuggestions();
                selectedProduct = null;
                selectedProductIdInput.value = '';
                itemPriceInput.value = '';
                return;
            }

            searchTimeout = setTimeout(() => {
                fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
                    .then(response => response.json())
                    .then(products => {
                        showSuggestions(products);
                    })
                    .catch(error => {
                        console.error('Error fetching products:', error);
                        hideSuggestions();
                    });
            }, 300);
        });

        // Keyboard navigation
        input.addEventListener('keydown', (e) => {
            if (currentProducts.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    selectedIndex = Math.min(selectedIndex + 1, currentProducts.length - 1);
                    highlightSuggestion(selectedIndex);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    selectedIndex = Math.max(selectedIndex - 1, -1);
                    highlightSuggestion(selectedIndex);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0 && currentProducts[selectedIndex]) {
                        selectProduct(currentProducts[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    hideSuggestions();
                    break;
            }
        });

        // Click outside to hide suggestions
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                hideSuggestions();
            }
        });

        // Focus handler
        input.addEventListener('focus', () => {
            if (input.value.trim().length >= 2) {
                const query = input.value.trim();
                fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
                    .then(response => response.json())
                    .then(products => {
                        showSuggestions(products);
                    })
                    .catch(error => {
                        console.error('Error fetching products:', error);
                    });
            }
        });
    }

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
            // Check if product is selected
            if (!selectedProduct || !selectedProductIdInput.value) {
                alert('Please select a product');
                isAddingItem = false; // Reset the flag
                return;
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
            productSearchSelect.value = '';
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
                <td class="hidden md:table-cell">${item.price.toFixed(2)} ${item.currency}</td>
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

        // Set the autocompleter input value
        productSearchSelect.value = item.productName;
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
