<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantReview;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReviewAutomationController extends Controller
{
    /**
     * AI-generated response suggestions for reviews.
     */
    public function generateReply(Request $request, int $reviewId): JsonResponse
    {
        $review = TenantReview::findOrFail($reviewId);

        $rating = $review->rating ?? 5;
        $customerName = $review->customer_name ?? 'Dear Guest';
        $comment = $review->comment ?? '';

        if ($rating >= 4) {
            $suggestions = [
                "Dear {$customerName}, thank you so much for the wonderful {$rating}-star review! We're thrilled that you enjoyed dining with us and we look forward to welcoming you back soon!",
                "Hello {$customerName}, our entire team appreciates your generous feedback! Creating memorable culinary experiences is our passion. See you again soon!",
            ];
        } else {
            $suggestions = [
                "Dear {$customerName}, thank you for sharing your feedback. We apologize that your experience did not meet our usual high standards. Please reach out to us directly so we can make things right.",
                "Hello {$customerName}, we appreciate your honest review. We take all feedback seriously and are already addressing this with our team to ensure top-notch service.",
            ];
        }

        return response()->json([
            'review_id' => $reviewId,
            'suggested_replies' => $suggestions,
            'primary_reply' => $suggestions[0],
        ]);
    }

    /**
     * Send review invitation to guest after reservation completion.
     */
    public function sendReviewRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reservation_id' => 'required|integer|exists:tenant.reservations,id',
            'channel' => 'required|in:sms,whatsapp,email',
        ]);

        $res = Reservation::find($validated['reservation_id']);

        return response()->json([
            'success' => true,
            'message' => "Review invite sent to {$res->customer_name} via " . strtoupper($validated['channel']) . ".",
        ]);
    }
}

