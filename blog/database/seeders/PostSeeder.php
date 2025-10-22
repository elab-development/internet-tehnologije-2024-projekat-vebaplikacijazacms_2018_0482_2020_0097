<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\User;
use App\Models\Category;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('role', 'user')->get();
        $categories = Category::all();

        if ($users->isEmpty() || $categories->isEmpty()) {
            return;
        }

        // Za svakog user-a napravi po 2-4 posta
        foreach ($users as $user) {
            $count = fake()->numberBetween(2, 4);

            Post::factory($count)->make()->each(function (Post $post) use ($user, $categories) {
                $post->user_id = $user->id;
                $post->category_id = $categories->random()->id;
                $post->save();
            });
        }
    }
}
