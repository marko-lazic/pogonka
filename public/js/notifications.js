// Function to handle notification click, update order table, and hide notification
function handleNotificationClick(event) {
    console.log('handleNotificationClick function triggered - Processing notification click');
    event.preventDefault();

    // Get the notification element
    const notification = document.getElementById('notification-alert');

    // Reload the orders page
    const orderTableContainer = document.getElementById('order-table-container');
    if (orderTableContainer) {
        window.location.href = '/orders';
    }

    // Hide the notification
    if (notification) {
        notification.classList.add('hidden');
    }
}

// Set up SSE connection for notifications
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event triggered - Notification system initialized');
    function setupEventSource() {
        const source = new EventSource('/notifications/events');

        source.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);

            if (data.type === 'order-change') {
                // Fetch and display the notification alert
                fetch('/notifications/alert')
                    .then(response => response.text())
                    .then(html => {
                        // Remove any existing notification
                        const existingAlert = document.getElementById('notification-alert');
                        if (existingAlert) {
                            existingAlert.remove();
                        }

                        // Add the new notification
                        document.getElementById('notification-container').innerHTML = html;
                    });
            }
        });

        source.addEventListener('error', function(event) {
            console.error('SSE connection error:', event);

            // Close the current connection
            source.close();

            // Try to reconnect after a delay
            setTimeout(setupEventSource, 5000);
        });

        return source;
    }

    // Initialize the EventSource
    const notificationSource = setupEventSource();
});
