<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\StaffMessage;
use App\Http\Controllers\Api\NotificationController;
use Carbon\Carbon;

class CheckUnpaidOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:check-unpaid';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Raise admin alerts and notify staff for served orders left unpaid for >24 hours';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Scanning for unpaid served orders older than 24 hours...");

        $threshold = Carbon::now()->subHours(24);

        // Scan all tenants or shared DB
        $orders = Order::withoutGlobalScopes()
            ->where('kitchen_status', 'served')
            ->where('payment_status', 'unpaid')
            ->where('served_at', '<=', $threshold)
            ->with(['staff.user'])
            ->get();

        if ($orders->isEmpty()) {
            $this->info("No overdue unpaid orders found.");
            return 0;
        }

        $count = 0;

        foreach ($orders as $order) {
            $tenantId = $order->tenant_id;
            $tableInfo = $order->table_code ? "Table {$order->table_code}" : "Order #{$order->id}";
            $amountFormatted = number_format((float) $order->total_amount, 2);

            // 1. Dispatch Admin / Owner Notification
            try {
                NotificationController::dispatch(
                    'alert',
                    "Unpaid Order Alert: {$tableInfo}",
                    "Order #{$order->id} ({$tableInfo}) was served 24+ hours ago and has not been marked as paid ($ {$amountFormatted}).",
                    'alert-triangle',
                    $order->id,
                    $tenantId
                );
            } catch (\Throwable $e) {
                $this->error("Failed to dispatch admin notification for order #{$order->id}: " . $e->getMessage());
            }

            // 2. Dispatch In-App Notification / Message to Staff Waiter
            if ($order->staff_profile_id) {
                try {
                    // Check if an alert was already sent in the last 24h to avoid duplicate flooding
                    $existingMessage = StaffMessage::withoutGlobalScopes()
                        ->where('tenant_id', $tenantId)
                        ->where('staff_profile_id', $order->staff_profile_id)
                        ->where('subject', 'like', "%Overdue Payment: Order #{$order->id}%")
                        ->where('created_at', '>=', Carbon::now()->subHours(24))
                        ->first();

                    if (!$existingMessage) {
                        StaffMessage::create([
                            'tenant_id' => $tenantId,
                            'staff_profile_id' => $order->staff_profile_id,
                            'sender_id' => null,
                            'to_all' => false,
                            'subject' => "Overdue Payment: Order #{$order->id} ({$tableInfo})",
                            'body' => "You served Order #{$order->id} for {$tableInfo} over 24 hours ago, but the payment of \${$amountFormatted} is still marked as unpaid. Please collect payment from the guest or update the status in the app.",
                        ]);
                    }
                } catch (\Throwable $e) {
                    $this->error("Failed to send staff message for order #{$order->id}: " . $e->getMessage());
                }
            }

            $count++;
        }

        $this->info("Processed {$count} overdue unpaid orders.");
        return 0;
    }
}
