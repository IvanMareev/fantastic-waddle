<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function index(): JsonResponse
    {
        $questions = Question::with(['topic', 'difficulty'])->get();

        return response()->json([
            'success' => true,
            'data' => $questions,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $question = Question::with(['topic', 'difficulty', 'keywords'])->find($id);

        if (! $question) {
            return response()->json([
                'success' => false,
                'message' => 'Вопрос не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $question,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'topic_id' => 'required|exists:topics,id',
            'difficulty_id' => 'nullable|exists:difficulties,id',
            'question_text' => 'required|string',
            'expected_answer' => 'required|string',
        ]);

        $question = Question::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Вопрос успешно создан',
            'data' => $question,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $question = Question::find($id);

        if (! $question) {
            return response()->json([
                'success' => false,
                'message' => 'Вопрос не найден',
            ], 404);
        }

        $validated = $request->validate([
            'topic_id' => 'sometimes|exists:topics,id',
            'difficulty_id' => 'nullable|exists:difficulties,id',
            'question_text' => 'sometimes|string',
            'expected_answer' => 'sometimes|string',
        ]);

        $question->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Вопрос успешно обновлён',
            'data' => $question,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $question = Question::find($id);

        if (! $question) {
            return response()->json([
                'success' => false,
                'message' => 'Вопрос не найден',
            ], 404);
        }

        $question->delete();

        return response()->json([
            'success' => true,
            'message' => 'Вопрос успешно удалён',
        ]);
    }

    public function getQuestionsByTopic(int $topic_id): JsonResponse
    {
        $questions = Question::with(['topic', 'difficulty'])
            ->where('topic_id', $topic_id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $questions,
        ]);
    }
}
