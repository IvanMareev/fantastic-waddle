<?php

namespace App\Http\Controllers;

use App\Models\Topic;
use Illuminate\Http\Request;

class TopicController extends Controller
{
    /**
     * Получить список всех тем
     */
    public function index()
    {
        $topics = Topic::all();

        return response()->json($topics);
    }

    /**
     * Создать новую тему
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $topic = Topic::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Topic created successfully',
            'data' => $topic,
        ], 201);
    }

    /**
     * Получить одну тему по ID
     */
    public function show($id)
    {
        $topic = Topic::find($id);

        if (!$topic) {
            return response()->json([
                'message' => 'Topic not found'
            ], 404);
        }

        return response()->json($topic);
    }

    /**
     * Обновить тему
     */
    public function update(Request $request, $id)
    {
        $topic = Topic::find($id);

        if (!$topic) {
            return response()->json([
                'message' => 'Topic not found'
            ], 404);
        }

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $topic->update($data);

        return response()->json([
            'message' => 'Topic updated successfully',
            'data' => $topic,
        ]);
    }

    /**
     * Удалить тему
     */
    public function destroy($id)
    {
        $topic = Topic::find($id);

        if (!$topic) {
            return response()->json([
                'message' => 'Topic not found'
            ], 404);
        }

        $topic->delete();

        return response()->json([
            'message' => 'Topic deleted successfully'
        ]);
    }
}
