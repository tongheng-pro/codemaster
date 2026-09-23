<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->nullable()->constrained()->nullOnDelete();
            $table->string('slug');
            $table->string('language')->default('html');
            $table->text('initial_code');
            $table->text('solution_code');
            $table->string('difficulty')->default('beginner'); // beginner, intermediate, advanced
            $table->integer('points')->default(10);
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->unique(['course_id', 'slug']);
        });

        Schema::create('exercise_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exercise_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->string('title');
            $table->text('instructions');
            $table->text('hint')->nullable();
            $table->timestamps();

            $table->unique(['exercise_id', 'locale']);
        });

        Schema::create('exercise_test_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exercise_id')->constrained()->cascadeOnDelete();
            $table->string('assertion_type'); // dom_element_exists, dom_text_contains, regex_match, dom_attribute_equals, css_property_equals
            $table->string('selector')->nullable();
            $table->text('expected_value')->nullable();
            $table->string('description')->nullable();
            $table->boolean('is_hidden')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercise_test_cases');
        Schema::dropIfExists('exercise_translations');
        Schema::dropIfExists('exercises');
    }
};
