<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantReview;
use App\Models\Reservation;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\NotificationController;

class PublicReviewController extends Controller
{
    /**
     * Submit a public guest review with both external and internal feedback.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'text' => 'required|string|max:2000',
            'internal_comment' => 'nullable|string|max:2000',
            'reservation_id' => 'nullable|integer',
            'order_id' => 'nullable|integer',
        ]);

        $tenantId = tenant('id');

        $review = TenantReview::create([
            'tenant_id' => $tenantId,
            'customer_name' => $validated['customer_name'],
            'rating' => $validated['rating'],
            'text' => $validated['text'],
            'internal_comment' => $validated['internal_comment'] ?? null,
            'reservation_id' => $validated['reservation_id'] ?? null,
            'order_id' => $validated['order_id'] ?? null,
            'is_published' => true,
            'sort_order' => 0,
        ]);

        // Dispatch alert to admin with notification
        $stars = str_repeat('★', $validated['rating']) . str_repeat('☆', 5 - $validated['rating']);
        $hasInternal = !empty($validated['internal_comment']) ? ' (with private staff feedback)' : '';
        NotificationController::dispatch(
            'review',
            "New Guest Review: {$validated['customer_name']} ({$stars})",
            "{$validated['customer_name']} left a {$validated['rating']}-star review{$hasInternal}: \"" . substr($validated['text'], 0, 80) . "...\"",
            'star',
            $review->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your review and valuable feedback!',
            'review' => $review,
        ], 201);
    }
}
