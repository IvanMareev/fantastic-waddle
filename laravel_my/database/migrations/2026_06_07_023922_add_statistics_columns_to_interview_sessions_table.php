<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('interview_sessions', function (Blueprint $table) {

            $table->unsignedInteger('answered_questions')
                ->default(0)
                ->after('total_questions');

        });
    }

    public function down(): void
    {
        Schema::table('interview_sessions', function (Blueprint $table) {
            $table->dropColumn([
                'total_questions',
                'answered_questions',
                'correct_answers',
                'wrong_answers',
            ]);
        });
    }
};
