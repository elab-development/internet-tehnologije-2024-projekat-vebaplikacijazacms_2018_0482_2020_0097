<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 15);
        $perPage = max(1, min(100, $perPage));
        $page    = (int) $request->input('page', 1);
        $qParam  = trim((string) $request->input('q', ''));

        $q = Post::query()
            ->with(['author:id,name', 'category:id,name'])
            ->withCount('likes')
            ->orderByDesc('created_at');

        if ($request->filled('user_id')) {
            $q->where('user_id', (int) $request->input('user_id'));
        }

        if ($request->filled('category_id')) {
            $q->where('category_id', (int) $request->input('category_id'));
        }

        if ($qParam !== '') {
            $q->where(function ($sub) use ($qParam) {
                $sub->where('title', 'like', "%{$qParam}%")
                    ->orWhere('content', 'like', "%{$qParam}%");
            });
        }

        $posts = $q->paginate($perPage, ['*'], 'page', $page);

        if ($posts->isEmpty()) {
            return response()->json('No posts found.', 404);
        }

        return response()->json([
            'posts' => PostResource::collection($posts),
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'per_page'     => $posts->perPage(),
                'total'        => $posts->total(),
                'last_page'    => $posts->lastPage(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!Auth::check() || Auth::user()->role !== 'user') {
            return response()->json(['error' => 'Only users can create posts'], 403);
        }

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'category_id' => 'required|exists:categories,id',
        ]);

        $post = Post::create([
            'title'       => $validated['title'],
            'content'     => $validated['content'],
            'category_id' => $validated['category_id'],
            'user_id'     => Auth::id(), // uvek autor = auth user
        ]);

        $post->load(['author:id,name', 'category:id,name'])->loadCount('likes');

        return response()->json([
            'message' => 'Post created successfully',
            'post'    => new PostResource($post),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        $post = Post::with(['author:id,name', 'category:id,name'])
            ->withCount('likes')
            ->whereKey($post->getKey())
            ->firstOrFail();

        return response()->json([
            'post' => new PostResource($post),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        if (!Auth::check() || Auth::user()->role !== 'user') {
            return response()->json(['error' => 'Only users can update posts'], 403);
        }

        if ($post->user_id !== Auth::id()) {
            return response()->json(['error' => 'You can update only your own posts'], 403);
        }

        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'content'     => 'sometimes|string',
            'category_id' => 'sometimes|exists:categories,id',
        ]);

        $post->update($validated);
        $post->load(['author:id,name', 'category:id,name'])->loadCount('likes');

        return response()->json([
            'message' => 'Post updated successfully',
            'post'    => new PostResource($post),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        if (!Auth::check() || Auth::user()->role !== 'user') {
            return response()->json(['error' => 'Only users can delete posts'], 403);
        }

        if ($post->user_id !== Auth::id()) {
            return response()->json(['error' => 'You can delete only your own posts'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }
}
