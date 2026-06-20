<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantBlog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TenantBlogController extends Controller
{
    public function index()
    {
        return response()->json(
            TenantBlog::orderBy('created_at', 'desc')->paginate(50)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:tenant_blog_posts,slug',
            'content' => 'nullable|string',
            'excerpt' => 'nullable|string',
            'image_url' => 'nullable|string|max:2048',
            'author' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'published_at' => 'nullable|date',
            'is_published' => 'boolean',
        ]);

        if (!isset($validated['slug']) || !$validated['slug']) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $post = TenantBlog::create($validated);
        return response()->json($post, 201);
    }

    public function show($id)
    {
        return response()->json(TenantBlog::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $post = TenantBlog::findOrFail($id);

        $validated = $request->validate([
            'title' => 'string|max:255',
            'slug' => 'nullable|string|max:255|unique:tenant_blog_posts,slug,' . $id,
            'content' => 'nullable|string',
            'excerpt' => 'nullable|string',
            'image_url' => 'nullable|string|max:2048',
            'author' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'published_at' => 'nullable|date',
            'is_published' => 'boolean',
        ]);

        $post->update($validated);
        return response()->json($post);
    }

    public function destroy($id)
    {
        $post = TenantBlog::findOrFail($id);
        $post->delete();
        return response()->json(['message' => 'Blog post deleted']);
    }
}
