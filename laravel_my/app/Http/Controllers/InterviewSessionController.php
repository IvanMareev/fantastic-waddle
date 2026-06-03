<?php

namespace App\Http\Controllers;

use App\Enums\EnumQuestionStatus;
use App\Enums\EnumSessionStatus;
use App\Enums\InterviewStatus;
use App\Jobs\ProcessAnswerLLMAnalyzeJob;
use App\Jobs\ProcessAudioAnswer;
use App\Jobs\ProcessUploadAudioJob;
use App\Models\InterviewSession;
use App\Models\UserAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;

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
            'status' => EnumSessionStatus::IN_PROGRESS,
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
            'data' => $session->load('session_questions.question')
        ], 201);
    }

    public function answerQuestion(Request $request, InterviewSession $session)
    {
        $validated = $request->validate([
            'audio' => 'required|file|mimes:mp3,wav,ogg,m4a|max:20480',
            'session_question_id' => 'required|integer|min:1'
        ]);

        if ($session->status != EnumSessionStatus::IN_PROGRESS->value) {
            return response()->json([
                'success' => false,
                'message' => 'Сессия интервью не активна',
                'current_status' => $session->status,
            ], 400);
        }
        $sessionQuestion = $session->session_questions()->where('id', $validated['session_question_id'])->first();
//        dd(json_encode($sessionQuestion));

        if (!$sessionQuestion) {
            return response()->json([
                'success' => false,
                'message' => 'Вопрос не найден в текущей сессии'
            ], 404);
        }

        $sessionQuestionId = $validated['session_question_id'];

        $userAnswer = UserAnswer::where('session_question_id', $sessionQuestionId)->first();


        if ($userAnswer) {
            return response()->json([
                'status' => $userAnswer->processing_step,
                'message' => 'Ответ на этот вопрос уже дали уже дали',
                'data' => $userAnswer
            ]);
        }

        $audioPath = $request->file('audio')->store('interview_answers/' . $session->id, 'public');


        Bus::chain([
            new ProcessUploadAudioJob(
                $audioPath,
                $sessionQuestionId
            ),
            new ProcessAudioAnswer(
                $sessionQuestionId
            ),
            new ProcessAnswerLLMAnalyzeJob(
                $sessionQuestionId
            )
        ])->dispatch();


        $questionAnswer = UserAnswer::firstOrCreate([
            'session_question_id' => $sessionQuestionId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Аудио ответ сохранен, распознавание запущено',
            'data' => $questionAnswer
        ]);
    }


    public function uploadAudio(Request $request)
    {
        $file = $request->file('audio');
        $path = $file->store('interview_audio', 'public');

        ProcessUploadAudioJob::dispatch($path);


        return response()->json([
            'success' => true,
            'path' => $path,
        ]);
    }

    public function getSessionAnswer(Request $request, InterviewSession $session)
    {
        $validated = $request->validate([
            'session_question_id' => 'required|integer|min:1',
        ]);

        $sessionQuestion = $session->session_questions()->where('id', $validated['session_question_id'])->first();

        if (!$sessionQuestion) {
            return response()->json([
                'success' => false,
                'message' => 'Вопрос не найден в текущей сессии'
            ], 404);
        }

        $userAnswer = UserAnswer::where('session_question_id', $sessionQuestion->id)->first();

        if (!$userAnswer) {
            return response()->json([
                'success' => false,
                'status' => EnumQuestionStatus::Uploaded,
                'message' => 'Ответ еще не найден',
                'data' => null
            ], 404);
        }

        return response()->json([
            'status' => $userAnswer->processing_step,
            'message' => 'Информация о статусе ответа получена',
            'data' => $userAnswer
        ]);
    }
}
