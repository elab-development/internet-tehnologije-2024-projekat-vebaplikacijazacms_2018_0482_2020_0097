<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;

class LikeSeeder extends Seeder
{
    public function run(): void
    {
        $posts = Post::all();
        $users = User::all();

        if ($posts->isEmpty() || $users->isEmpty()) {
            return;
        }

        foreach ($posts as $post) {
            // Slučajan broj lajkova po postu (0 do broj korisnika - 1)
            $max = max(0, $users->count() - 1);
            $likeCount = fake()->numberBetween(0, min(8, $max)); // ograniči do 8 radi realnosti

            // Kandidati: svi osim autora
            $candidates = $users->where('id', '!=', $post->user_id)->shuffle()->take($likeCount);

            foreach ($candidates as $u) {
                // unique(post_id, user_id) je u migraciji; koristimo firstOrCreate da ne puca
                Like::firstOrCreate([
                    'post_id' => $post->id,
                    'user_id' => $u->id,
                ]);
            }
        }

        for ($i = 0; $i < 10; $i++) {
            $p = $posts->random();
            $u = $users->where('id', '!=', $p->user_id)->random();
            Like::firstOrCreate(['post_id' => $p->id, 'user_id' => $u->id]);
        }
    }
}
