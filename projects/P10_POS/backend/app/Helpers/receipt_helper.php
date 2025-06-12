<?php

if (!function_exists('generate_receipt_data')) {
    /**
     * Generate formatted receipt data from transaction
     */
    function generate_receipt_data(array $transaction, array $store = null): array
    {
        $receipt = [
            'receipt_number' => null, // Will be set by ReceiptModel
            'transaction_number' => $transaction['transaction_number'] ?? '',
            'date' => isset($transaction['created_at']) ? date('Y-m-d H:i:s', strtotime($transaction['created_at'])) : date('Y-m-d H:i:s'),
            'store' => [
                'name' => $store['name'] ?? 'Store',
                'address' => $store['address'] ?? '',
                'phone' => $store['phone'] ?? '',
                'email' => $store['email'] ?? '',
            ],
            'cashier' => [
                'name' => $transaction['cashier']['name'] ?? 'Cashier',
                'id' => $transaction['cashier_id'] ?? null,
            ],
            'customer' => null,
            'items' => [],
            'totals' => [
                'subtotal' => $transaction['subtotal'] ?? '0.00',
                'tax_amount' => $transaction['tax_amount'] ?? '0.00',
                'discount_amount' => $transaction['discount_amount'] ?? '0.00',
                'total_amount' => $transaction['total_amount'] ?? '0.00',
            ],
            'payment' => null,
        ];

        // Add customer if exists
        if (isset($transaction['customer']) && $transaction['customer']) {
            $receipt['customer'] = [
                'name' => $transaction['customer']['name'] ?? '',
                'email' => $transaction['customer']['email'] ?? '',
                'phone' => $transaction['customer']['phone'] ?? '',
            ];
        }

        // Format items
        if (isset($transaction['items']) && is_array($transaction['items'])) {
            foreach ($transaction['items'] as $item) {
                $receipt['items'][] = [
                    'product_name' => $item['product_name'] ?? $item['name'] ?? 'Product',
                    'variant' => null,
                    'quantity' => $item['quantity'] ?? 1,
                    'unit_price' => $item['unit_price'] ?? '0.00',
                    'line_total' => $item['line_total'] ?? '0.00',
                ];

                // Add variant info if exists
                if (isset($item['variant_name']) && isset($item['variant_value'])) {
                    $receipt['items'][count($receipt['items']) - 1]['variant'] = [
                        'name' => $item['variant_name'],
                        'value' => $item['variant_value'],
                    ];
                }
            }
        }

        // Add payment info if exists
        if (isset($transaction['payments']) && is_array($transaction['payments']) && count($transaction['payments']) > 0) {
            $payment = $transaction['payments'][0];
            $receipt['payment'] = [
                'method' => $payment['payment_method'] ?? 'cash',
                'amount' => $payment['amount'] ?? '0.00',
                'change_amount' => $payment['change_amount'] ?? '0.00',
                'reference_number' => $payment['reference_number'] ?? null,
            ];
        }

        return $receipt;
    }
}

if (!function_exists('format_receipt_html')) {
    /**
     * Format receipt data as HTML
     */
    function format_receipt_html(array $receiptData, string $template = 'default'): string
    {
        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receipt - ' . htmlspecialchars($receiptData['transaction_number']) . '</title>
    <style>
        body {
            font-family: "Courier New", monospace;
            max-width: 300px;
            margin: 0 auto;
            padding: 20px;
            font-size: 12px;
            line-height: 1.4;
        }
        .receipt-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px dashed #000;
            padding-bottom: 15px;
        }
        .receipt-header h1 {
            margin: 0 0 10px 0;
            font-size: 18px;
            font-weight: bold;
        }
        .receipt-info {
            margin-bottom: 15px;
            font-size: 11px;
        }
        .receipt-info p {
            margin: 3px 0;
        }
        .receipt-items {
            margin: 15px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
        }
        .receipt-items table {
            width: 100%;
            border-collapse: collapse;
        }
        .receipt-items th {
            text-align: left;
            padding: 5px 0;
            border-bottom: 1px solid #ccc;
            font-size: 10px;
        }
        .receipt-items td {
            padding: 4px 0;
            font-size: 11px;
        }
        .receipt-items .item-name {
            width: 50%;
        }
        .receipt-items .item-qty {
            width: 15%;
            text-align: center;
        }
        .receipt-items .item-price {
            width: 35%;
            text-align: right;
        }
        .receipt-totals {
            margin: 15px 0;
            font-size: 11px;
        }
        .receipt-totals .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }
        .receipt-totals .total-row.total {
            font-weight: bold;
            font-size: 13px;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #000;
        }
        .receipt-payment {
            margin: 15px 0;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 4px;
            font-size: 11px;
        }
        .receipt-footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px dashed #000;
            font-style: italic;
            font-size: 10px;
        }
        @media print {
            body {
                max-width: 100%;
                padding: 10px;
            }
        }
    </style>
</head>
<body>';

        // Store Header
        $html .= '<div class="receipt-header">';
        $html .= '<h1>' . htmlspecialchars($receiptData['store']['name']) . '</h1>';
        if (!empty($receiptData['store']['address'])) {
            $html .= '<p>' . htmlspecialchars($receiptData['store']['address']) . '</p>';
        }
        if (!empty($receiptData['store']['phone'])) {
            $html .= '<p>Tel: ' . htmlspecialchars($receiptData['store']['phone']) . '</p>';
        }
        if (!empty($receiptData['store']['email'])) {
            $html .= '<p>' . htmlspecialchars($receiptData['store']['email']) . '</p>';
        }
        $html .= '</div>';

        // Transaction Info
        $html .= '<div class="receipt-info">';
        $html .= '<p><strong>Transaction #:</strong> ' . htmlspecialchars($receiptData['transaction_number']) . '</p>';
        $html .= '<p><strong>Date:</strong> ' . htmlspecialchars($receiptData['date']) . '</p>';
        $html .= '<p><strong>Cashier:</strong> ' . htmlspecialchars($receiptData['cashier']['name']) . '</p>';
        if ($receiptData['customer']) {
            $html .= '<p><strong>Customer:</strong> ' . htmlspecialchars($receiptData['customer']['name']) . '</p>';
            if (!empty($receiptData['customer']['phone'])) {
                $html .= '<p>Phone: ' . htmlspecialchars($receiptData['customer']['phone']) . '</p>';
            }
        }
        $html .= '</div>';

        // Items
        $html .= '<div class="receipt-items">';
        $html .= '<table>';
        $html .= '<thead><tr>';
        $html .= '<th class="item-name">Item</th>';
        $html .= '<th class="item-qty">Qty</th>';
        $html .= '<th class="item-price">Price</th>';
        $html .= '</tr></thead>';
        $html .= '<tbody>';

        foreach ($receiptData['items'] as $item) {
            $html .= '<tr>';
            $itemName = htmlspecialchars($item['product_name']);
            if ($item['variant']) {
                $itemName .= ' (' . htmlspecialchars($item['variant']['name']) . ': ' . htmlspecialchars($item['variant']['value']) . ')';
            }
            $html .= '<td class="item-name">' . $itemName . '</td>';
            $html .= '<td class="item-qty">' . htmlspecialchars($item['quantity']) . '</td>';
            $html .= '<td class="item-price">$' . number_format((float)$item['line_total'], 2) . '</td>';
            $html .= '</tr>';
        }

        $html .= '</tbody></table>';
        $html .= '</div>';

        // Totals
        $html .= '<div class="receipt-totals">';
        $html .= '<div class="total-row">';
        $html .= '<span>Subtotal:</span>';
        $html .= '<span>$' . number_format((float)$receiptData['totals']['subtotal'], 2) . '</span>';
        $html .= '</div>';

        if ((float)$receiptData['totals']['discount_amount'] > 0) {
            $html .= '<div class="total-row">';
            $html .= '<span>Discount:</span>';
            $html .= '<span>-$' . number_format((float)$receiptData['totals']['discount_amount'], 2) . '</span>';
            $html .= '</div>';
        }

        if ((float)$receiptData['totals']['tax_amount'] > 0) {
            $html .= '<div class="total-row">';
            $html .= '<span>Tax:</span>';
            $html .= '<span>$' . number_format((float)$receiptData['totals']['tax_amount'], 2) . '</span>';
            $html .= '</div>';
        }

        $html .= '<div class="total-row total">';
        $html .= '<span>Total:</span>';
        $html .= '<span>$' . number_format((float)$receiptData['totals']['total_amount'], 2) . '</span>';
        $html .= '</div>';
        $html .= '</div>';

        // Payment
        if ($receiptData['payment']) {
            $html .= '<div class="receipt-payment">';
            $html .= '<p><strong>Payment Method:</strong> ' . ucfirst(str_replace('_', ' ', $receiptData['payment']['method'])) . '</p>';
            $html .= '<p><strong>Amount Paid:</strong> $' . number_format((float)$receiptData['payment']['amount'], 2) . '</p>';
            if ((float)$receiptData['payment']['change_amount'] > 0) {
                $html .= '<p><strong>Change:</strong> $' . number_format((float)$receiptData['payment']['change_amount'], 2) . '</p>';
            }
            if (!empty($receiptData['payment']['reference_number'])) {
                $html .= '<p><strong>Ref #:</strong> ' . htmlspecialchars($receiptData['payment']['reference_number']) . '</p>';
            }
            $html .= '</div>';
        }

        // Footer
        $html .= '<div class="receipt-footer">';
        $html .= '<p>Thank you for your purchase!</p>';
        $html .= '<p>Please keep this receipt for your records</p>';
        $html .= '</div>';

        $html .= '</body></html>';

        return $html;
    }
}

if (!function_exists('format_receipt_text')) {
    /**
     * Format receipt data as plain text (for thermal printers)
     */
    function format_receipt_text(array $receiptData): string
    {
        $text = "\n";
        $text .= str_repeat('=', 32) . "\n";
        $text .= str_pad($receiptData['store']['name'], 32, ' ', STR_PAD_BOTH) . "\n";
        $text .= str_repeat('=', 32) . "\n";
        
        if (!empty($receiptData['store']['address'])) {
            $text .= wordwrap($receiptData['store']['address'], 32, "\n", true) . "\n";
        }
        if (!empty($receiptData['store']['phone'])) {
            $text .= "Tel: " . $receiptData['store']['phone'] . "\n";
        }
        
        $text .= str_repeat('-', 32) . "\n";
        $text .= "Transaction #: " . $receiptData['transaction_number'] . "\n";
        $text .= "Date: " . $receiptData['date'] . "\n";
        $text .= "Cashier: " . $receiptData['cashier']['name'] . "\n";
        
        if ($receiptData['customer']) {
            $text .= "Customer: " . $receiptData['customer']['name'] . "\n";
        }
        
        $text .= str_repeat('-', 32) . "\n";
        
        // Items
        foreach ($receiptData['items'] as $item) {
            $itemName = $item['product_name'];
            if ($item['variant']) {
                $itemName .= ' (' . $item['variant']['name'] . ': ' . $item['variant']['value'] . ')';
            }
            $text .= wordwrap($itemName, 20, "\n", true) . "\n";
            $text .= str_pad($item['quantity'] . ' x $' . number_format((float)$item['unit_price'], 2), 20, ' ', STR_PAD_LEFT);
            $text .= str_pad('$' . number_format((float)$item['line_total'], 2), 12, ' ', STR_PAD_LEFT) . "\n";
        }
        
        $text .= str_repeat('-', 32) . "\n";
        $text .= str_pad("Subtotal:", 20) . str_pad('$' . number_format((float)$receiptData['totals']['subtotal'], 2), 12, ' ', STR_PAD_LEFT) . "\n";
        
        if ((float)$receiptData['totals']['discount_amount'] > 0) {
            $text .= str_pad("Discount:", 20) . str_pad('-$' . number_format((float)$receiptData['totals']['discount_amount'], 2), 12, ' ', STR_PAD_LEFT) . "\n";
        }
        
        if ((float)$receiptData['totals']['tax_amount'] > 0) {
            $text .= str_pad("Tax:", 20) . str_pad('$' . number_format((float)$receiptData['totals']['tax_amount'], 2), 12, ' ', STR_PAD_LEFT) . "\n";
        }
        
        $text .= str_repeat('=', 32) . "\n";
        $text .= str_pad("TOTAL:", 20, ' ', STR_PAD_LEFT) . str_pad('$' . number_format((float)$receiptData['totals']['total_amount'], 2), 12, ' ', STR_PAD_LEFT) . "\n";
        $text .= str_repeat('=', 32) . "\n";
        
        if ($receiptData['payment']) {
            $text .= "Payment: " . ucfirst(str_replace('_', ' ', $receiptData['payment']['method'])) . "\n";
            $text .= "Paid: $" . number_format((float)$receiptData['payment']['amount'], 2) . "\n";
            if ((float)$receiptData['payment']['change_amount'] > 0) {
                $text .= "Change: $" . number_format((float)$receiptData['payment']['change_amount'], 2) . "\n";
            }
        }
        
        $text .= "\n";
        $text .= str_pad("Thank you!", 32, ' ', STR_PAD_BOTH) . "\n";
        $text .= "\n";
        
        return $text;
    }
}

