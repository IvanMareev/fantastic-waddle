<?php

namespace App\Http\Controllers;

use App\Enums\InterviewStatus;
use App\Models\InterviewSession;
use Illuminate\Http\Request;

class InterviewSessionController extends Controller
{
    /**
     * Начать новую сессию интервью
     */
    public function startSession(Request $request)
    {
        $validated = $request->validate([
            'total_questions' => 'nullable|integer|min:1|max:20',
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

        return response()->json([
            'success' => true,
            'message' => 'Сессия интервью успешно создана',
            'data' => $session
        ], 201);
    }
}
