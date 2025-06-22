document.addEventListener('DOMContentLoaded', function() {
    // Get all order items
    const orderItems = document.querySelectorAll('.order-item');

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
});