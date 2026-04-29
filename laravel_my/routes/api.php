<?php


use App\Http\Controllers\AuthController;
use App\Http\Controllers\InterviewSessionController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\TopicController;
use Illuminate\Support\Facades\Route;

Route::get('/test', [TestController::class, 'index']);


Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);


    Route::apiResource('topics', TopicController::class);

    Route::prefix('question')->group(function () {
        Route::get('/', [QuestionController::class, 'index']);
        Route::get('/{id}', [QuestionController::class, 'show']);
        Route::get('/topic/{topic_id}', [QuestionController::class, 'getQuestionsByTopic']);
        Route::post('/', [QuestionController::class, 'store']);
        Route::put('/{id}', [QuestionController::class, 'update']);
        Route::patch('/{id}', [QuestionController::class, 'update']);
        Route::delete('/{id}', [QuestionController::class, 'destroy']);
    });

    Route::prefix('Session')->group(function () {
        Route::post('/', [InterviewSessionController::class, 'startSession']);
    });
});
