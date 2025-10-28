<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'name' => 'Programming',
                'description' => 'Languages, frameworks, tips & tricks.'
            ],
            [
                'name' => 'Design',
                'description' => 'UI/UX, typography, and product design.'
            ],
            [
                'name' => 'Data & AI',
                'description' => 'ML, analytics, and data engineering.'
            ],
            [
                'name' => 'DevOps',
                'description' => 'CI/CD, containers, cloud ops.'
            ],
            [
                'name' => 'Business',
                'description' => 'Startups, strategy, and product.'
            ],
            [
                'name' => 'Lifestyle',
                'description' => 'Travel, food, and daily habits.'
            ],
        ];

        foreach ($items as $it) {
            Category::firstOrCreate(['name' => $it['name']], $it);
        }
    }
}
