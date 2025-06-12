<h2>Reservation Confirmed</h2>
<p>Dear {{ $reservation->user->name }},</p>
<p>Your reservation is confirmed with the following details:</p>
<ul>
    <li><strong>Table:</strong> {{ $reservation->table->number ?? '-' }}</li>
    <li><strong>Date & Time:</strong> {{ $reservation->time_slot }}</li>
    <li><strong>Guests:</strong> {{ $reservation->guests }}</li>
    <li><strong>Status:</strong> {{ $reservation->status }}</li>
    <li><strong>Special Requests:</strong> {{ $reservation->special_requests }}</li>
</ul>
<p>Thank you for booking with us!</p> 