<h2>Payment Receipt</h2>
<p>Dear {{ $order->reservation->user->name ?? 'Customer' }},</p>
<p>Thank you for your payment. Here are your order details:</p>
<ul>
    <li><strong>Order ID:</strong> #{{ $order->id }}</li>
    <li><strong>Reservation:</strong> #{{ $order->reservation->id ?? '-' }}</li>
    <li><strong>Total Paid:</strong> ${{ number_format($order->total, 2) }}</li>
    <li><strong>Status:</strong> {{ $order->status }}</li>
    <li><strong>Paid:</strong> {{ $order->paid ? 'Yes' : 'No' }}</li>
</ul>
<p>If you have any questions, please contact us.</p> 