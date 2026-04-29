<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/question",
     *     tags={"Questions"},
     *     summary="Получить все вопросы",
     *     @OA\Response(
     *         response=200,
     *         description="Список вопросов"
     *     )
     * )
     */
    public function index()
    {
        $questions = Question::with(['topic', 'difficulty'])->get();

        return response()->json([
            'success' => true,
            'data' => $questions
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/question/{id}",
     *     tags={"Questions"},
     *     summary="Получить вопрос по ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID вопроса",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Вопрос найден"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Не найден"
     *     )
     * )
     */
    public function show($id)
    {
        $question = Question::with(['topic', 'difficulty', 'keywords'])->find($id);

        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Вопрос не найден'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $question
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/question",
     *     tags={"Questions"},
     *     summary="Создать вопрос",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"topic_id","question_text","expected_answer"},
     *             @OA\Property(property="topic_id", type="integer"),
     *             @OA\Property(property="difficulty_id", type="integer"),
     *             @OA\Property(property="question_text", type="string"),
     *             @OA\Property(property="expected_answer", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Создано"
     *     )
     * )
     */
    public function store(Request $request)
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
            'data' => $question
        ], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/question/{id}",
     *     tags={"Questions"},
     *     summary="Обновить вопрос",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Обновлено"
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $question = Question::find($id);

        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Вопрос не найден'
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
            'data' => $question
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/question/{id}",
     *     tags={"Questions"},
     *     summary="Удалить вопрос",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Удалено"
     *     )
     * )
     */
    public function destroy($id)
    {
        $question = Question::find($id);

        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Вопрос не найден'
            ], 404);
        }

        $question->delete();

        return response()->json([
            'success' => true,
            'message' => 'Вопрос успешно удалён'
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/question/topic/{topic_id}",
     *     tags={"Questions"},
     *     summary="Вопросы по теме",
     *     @OA\Parameter(
     *         name="topic_id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Список вопросов"
     *     )
     * )
     */
    public function getQuestionsByTopic($topic_id)
    {
        $questions = Question::with(['topic', 'difficulty'])
            ->where('topic_id', $topic_id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $questions
        ]);
    }
}
