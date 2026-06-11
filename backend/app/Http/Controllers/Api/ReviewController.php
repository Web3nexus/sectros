<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantReview;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index()
    {
        return response()->json(TenantReview::orderBy('sort_order')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_avatar' => 'nullable|string|max:2048',
            'rating' => 'nullable|integer|min:1|max:5',
            'text' => 'required|string',
            'location' => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $review = TenantReview::create($validated);
        return response()->json($review, 201);
    }

    public function show($id)
    {
        return response()->json(TenantReview::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $review = TenantReview::findOrFail($id);

        $validated = $request->validate([
            'customer_name' => 'string|max:255',
            'customer_avatar' => 'nullable|string|max:2048',
            'rating' => 'integer|min:1|max:5',
            'text' => 'string',
            'location' => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $review->update($validated);
        return response()->json($review);
    }

    public function destroy($id)
    {
        $review = TenantReview::findOrFail($id);
        $review->delete();
        return response()->json(['message' => 'Review deleted']);
    }
}
