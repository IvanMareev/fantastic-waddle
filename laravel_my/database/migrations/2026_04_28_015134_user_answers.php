<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_answers', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->foreignId('session_question_id')
                ->constrained('session_questions')
                ->cascadeOnDelete();

            $table->text('audio_file_url')->nullable();
            $table->text('transcript')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->text('ai_explanation')->nullable();
            $table->text('ai_audio_url')->nullable();

            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_answers');
    }
};
