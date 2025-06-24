// Global flag to track if the page has been initialized
let isDetailsPageInitialized = false;

// Function to initialize the order details functionality
function initializeOrderDetailsPage() {
    // Check if we're on the order details page
    const orderItems = document.querySelectorAll('.order-item');
    if (orderItems.length === 0) {
        // No order items found, this might not be the order details page
        return;
    }

    // If the page is already initialized, don't initialize again
    if (isDetailsPageInitialized) {
        console.log('Order details page already initialized, skipping initialization');
        return;
    }

    // For each order item, fetch the product name
    orderItems.forEach(item => {
        const productId = item.dataset.productId;
        const productNameElement = item.querySelector('.product-name');

        if (productId && productNameElement) {
            // Fetch product details
            fetch(`/api/products/search?q=${productId}`)
                .then(response => response.json())
                .then(products => {
                    if (products && products.length > 0) {
                        // Find the product with matching ID
                        const product = products.find(p => p.id === productId);
                        if (product) {
                            // Update the product name
                            productNameElement.textContent = product.name;
                        }
                    }
                })
                .catch(error => console.error('Error fetching product:', error));
        }
    });

    // Mark the page as initialized
    isDetailsPageInitialized = true;
    console.log('Order details page initialization complete');
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeOrderDetailsPage);

// Function to reset initialization flag
function resetOrderDetailsInitialization() {
    isDetailsPageInitialized = false;
    console.log('Order details page initialization flag reset');
}

// Initialize on HTMX events (for HTMX navigation)
document.addEventListener('htmx:afterSwap', function() {
    resetOrderDetailsInitialization();
    initializeOrderDetailsPage();
});
document.addEventListener('htmx:load', initializeOrderDetailsPage);
document.addEventListener('htmx:afterOnLoad', initializeOrderDetailsPage);

// Add a direct call to initialize when the script loads
// This ensures initialization happens even if the events don't fire
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeOrderDetailsPage, 1);
}
