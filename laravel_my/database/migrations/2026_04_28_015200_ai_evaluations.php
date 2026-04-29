<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ai_evaluations', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->foreignId('user_answer_id')
                ->constrained('user_answers')
                ->cascadeOnDelete();

            $table->text('prompt_question')->nullable();
            $table->text('prompt_expected_answer')->nullable();
            $table->text('prompt_user_answer')->nullable();

            $table->string('model_name')->nullable();
            $table->text('raw_response')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::table('ai_evaluations', function (Blueprint $table) {
            //
        });
    }
};
