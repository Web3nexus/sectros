<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DirectoryCategory;
use App\Models\DirectoryListing;
use Illuminate\Http\Request;

class DirectoryController extends Controller
{
    /**
     * Get all directory categories.
     */
    public function categories()
    {
        return response()->json(DirectoryCategory::withCount('listings')->get());
    }

    /**
     * Search and list businesses in the directory.
     */
    public function index(Request $request)
    {
        $query = DirectoryListing::with('category')->where('is_published', true);

        if ($request->has('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->has('type')) {
            $query->where('business_type', $request->type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($request->has('featured')) {
            $query->where('is_featured', true);
        }

        $listings = $query->latest()->paginate(12);

        return response()->json($listings);
    }

    /**
     * Get a single listing detail.
     */
    public function show($id)
    {
        $listing = DirectoryListing::with(['category', 'reviews'])->findOrFail($id);
        return response()->json($listing);
    }

    public function claim(Request $request, $id)
    {
        $listing = DirectoryListing::findOrFail($id);
        
        if ($listing->claim_status === 'claimed') {
            return response()->json(['message' => 'This listing is already claimed.'], 422);
        }

        $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'verification_email' => 'required|email'
        ]);

        $token = \Illuminate\Support\Str::random(32);
        $listing->update([
            'claim_status' => 'pending',
            'claim_token' => $token,
            'tenant_id' => $request->tenant_id
        ]);

        // In a real app, send email here
        // Mail::to($request->verification_email)->send(new ClaimVerificationMail($token));

        return response()->json([
            'message' => 'Claim request submitted. Please check your email for verification.',
            'debug_token' => $token // For development purposes
        ]);
    }

    public function verifyClaim(Request $request, $id)
    {
        $listing = DirectoryListing::findOrFail($id);
        $request->validate(['token' => 'required|string']);

        if ($listing->claim_token !== $request->token) {
            return response()->json(['message' => 'Invalid verification token.'], 422);
        }

        $listing->update([
            'claim_status' => 'claimed',
            'is_verified' => true,
            'claim_token' => null
        ]);

        return response()->json(['message' => 'Listing successfully claimed and verified.']);
    }
}
