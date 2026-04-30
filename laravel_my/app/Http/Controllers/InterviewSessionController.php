<?php

namespace App\Http\Controllers;

use App\Enums\InterviewStatus;
use App\Models\InterviewSession;
use Illuminate\Http\Request;
use App\Jobs\ProcessAudioAnswer;

class InterviewSessionController extends Controller
{
    /**
     * Начать новую сессию интервью
     */
    public function startSession(Request $request)
    {
        $validated = $request->validate([
            'question_ids' => 'required|array|min:1',
            'question_ids.*' => 'integer|distinct|exists:questions,id',
        ]);

        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Пользователь не авторизован'
            ], 401);
        }

        $session = InterviewSession::create([
            'user_id' => $user->id,
            'status' => InterviewStatus::IN_PROGRESS,
            'started_at' => now(),
        ]);

        $sessionQuestions = collect($validated['question_ids'])->map(function ($questionId, $index) {
            return [
                'question_id' => $questionId,
                'question_order' => $index + 1,
                'asked_at' => now(),
            ];
        })->all();

        $session->session_questions()->createMany($sessionQuestions);

        return response()->json([
            'success' => true,
            'message' => 'Сессия интервью успешно создана',
            'data' => $session->load('session_questions')
        ], 201);
    }

    public function answerQuestion(Request $request, InterviewSession $session, $questionId)
    {
        $validated = $request->validate([
            'audio' => 'required|file|mimes:mp3,wav,ogg,m4a|max:20480', // макс 20MB
        ]);

        if ($session->status !== InterviewStatus::IN_PROGRESS) {
            return response()->json([
                'success' => false,
                'message' => 'Сессия интервью не активна'
            ], 400);
        }

        $sessionQuestion = $session->session_questions()->where('question_id', $questionId)->first();

        if (!$sessionQuestion) {
            return response()->json([
                'success' => false,
                'message' => 'Вопрос не найден в текущей сессии'
            ], 404);
        }

        // Сохраняем аудиофайл
        $audioPath = $request->file('audio')->store('interview_answers/' . $session->id, 'public');

        // Опционально: запустить задачу на распознавание речи (например, через Yandex SpeechKit, Google Speech-to-Text)
        dispatch(new ProcessAudioAnswer($sessionQuestion->id, $audioPath));

        $sessionQuestion->update([
            'answer_audio_path' => $audioPath,
            'answered_at' => now(),
            'answer_text' => null, // будет заполнено асинхронно после распознавания
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Аудиоответ сохранен, распознавание запущено',
            'data' => $sessionQuestion
        ]);
    }
}
