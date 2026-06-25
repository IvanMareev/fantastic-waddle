<?php

namespace App\Http\Controllers;

use App\DTO\AnswerQuestionData;
use App\DTO\GetAllSessionsData;
use App\DTO\GetSessionAnswerData;
use App\DTO\StartInterviewSessionData;
use App\Http\Requests\AnswerQuestionRequest;
use App\Http\Requests\GetAllSessionsRequest;
use App\Http\Requests\GetSessionAnswerRequest;
use App\Http\Requests\StartSessionRequest;
use App\Http\Resources\GetAllSessionsResource;
use App\Models\InterviewSession;
use App\Services\answerQuestionService;
use App\Services\GetAllSessionsService;
use App\Services\GetCurrentQuestionService;
use App\Services\GetSessionAnswerService;
use App\Services\StartInterviewSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class InterviewSessionController extends Controller
{
    public function startSession(
        StartSessionRequest $request,
        StartInterviewSessionService $service
    ): JsonResponse {

        $session = $service->execute(
            StartInterviewSessionData::fromRequest($request),
        );

        return response()->json([
            'success' => true,
            'message' => __('interview.success_start_session'),
            'data' => $session,
        ], Response::HTTP_CREATED);
    }

    public function answerQuestion(
        AnswerQuestionRequest $request,
        InterviewSession $session,
        answerQuestionService $service
    ): JsonResponse {

        $answer = $service->execute(
            $session,
            AnswerQuestionData::fromRequest($request)
        );

        return response()->json([
            'success' => true,
            'data' => $answer,
        ]);
    }

    public function getSessionAnswer(GetSessionAnswerRequest $request,
        InterviewSession $session,
        GetSessionAnswerService $service): JsonResponse
    {
        $request = $service->execute(
            $session,
            GetSessionAnswerData::fromRequest($request)
        );

        return response()->json([
            'success' => true,
            'data' => $request,
        ]);
    }

    public function getCurrentQuestion(GetAllSessionsRequest $request, InterviewSession $session, GetCurrentQuestionService $service)
    {
        $request = $service->execute(GetAllSessionsData::fromRequest($request), $session);

        return response()->json([
            'success' => true,
            'data' => $request,
        ]);
    }

    public function getAllSessions(GetAllSessionsRequest $request,
        GetAllSessionsService $service): AnonymousResourceCollection
    {
        return GetAllSessionsResource::collection(
            $service->execute(GetAllSessionsData::fromRequest($request))
        );
    }
}
