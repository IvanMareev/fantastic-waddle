<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('session_questions', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->foreignId('session_id')
                ->constrained('interview_sessions')
                ->cascadeOnDelete();

            $table->foreignId('question_id')
                ->constrained('questions');

            $table->integer('question_order');
            $table->timestamp('asked_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_questions');
    }
};
