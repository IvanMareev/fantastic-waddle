<?php

namespace App\Services;

use App\DTO\GetAllSessionsData;
use App\Models\InterviewSession;
use Exception;
use Illuminate\Pagination\LengthAwarePaginator;

class GetCurrentQuestionService
{
    /**
     * @throws Exception
     */
    public function execute(GetAllSessionsData $data, InterviewSession $session)
    {
        $getAllSessionService = new GetAllSessionsService;
        $session = $getAllSessionService->execute($data, $session);
        dd($session);
        $sessionQuestion = $session;

        return $sessionQuestion;
    }
}
