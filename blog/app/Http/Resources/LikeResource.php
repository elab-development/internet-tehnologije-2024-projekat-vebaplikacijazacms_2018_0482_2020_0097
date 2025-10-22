<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LikeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'post'     => [
                'id'    => $this->post->id,
                'title' => $this->post->title,
            ],
            'user'     => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ],
        ];
    }
}
