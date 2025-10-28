<?php

namespace App\Http\Controllers;

use App\Http\Resources\LikeResource;
use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Post $post)
    {
        $perPage = (int) $request->input('per_page', 20);
        $perPage = max(1, min(100, $perPage));
        $page    = (int) $request->input('page', 1);

        $likes = $post->likes()
            ->with(['user:id,name'])
            ->latest()
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'likes' => LikeResource::collection($likes),
            'pagination' => [
                'current_page' => $likes->currentPage(),
                'per_page'     => $likes->perPage(),
                'total'        => $likes->total(),
                'last_page'    => $likes->lastPage(),
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
    public function store(Post $post)
    {
        if (!Auth::check() || Auth::user()->role !== 'user') {
            return response()->json(['error' => 'Only users can like posts'], 403);
        }

        $like = Like::firstOrCreate([
            'post_id' => $post->id,
            'user_id' => Auth::id(),
        ]);

        $like->load(['user:id,name', 'post:id,title']);

        return response()->json([
            'message' => $like->wasRecentlyCreated ? 'Post liked' : 'Already liked',
            'like'    => new LikeResource($like),
        ], $like->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Like $like)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Like $like)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Like $like)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        if (!Auth::check() || Auth::user()->role !== 'user') {
            return response()->json(['error' => 'Only users can dislike posts'], 403);
        }

        $deleted = Like::where('post_id', $post->id)
            ->where('user_id', Auth::id())
            ->delete();

        if (!$deleted) {
            return response()->json(['error' => "You haven't liked this post"], 404);
        }

        return response()->json(['message' => 'Post disliked']);
    }
}
