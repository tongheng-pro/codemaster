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
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('course_sections')->nullOnDelete();
            $table->string('slug');
            $table->integer('order')->default(0);
            $table->integer('duration_minutes')->default(5);
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->unique(['course_id', 'slug']);
        });

        Schema::create('lesson_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('content_blocks')->nullable(); // structured content: headings, paragraphs, tips, code blocks, etc.
            $table->timestamps();

            $table->unique(['lesson_id', 'locale']);
        });

        Schema::create('code_examples', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->string('language')->default('html'); // html, css, javascript, php, etc.
            $table->text('initial_code');
            $table->text('solution_code')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('code_example_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('code_example_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->string('title')->nullable();
            $table->text('explanation')->nullable();
            $table->timestamps();

            $table->unique(['code_example_id', 'locale']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('code_example_translations');
        Schema::dropIfExists('code_examples');
        Schema::dropIfExists('lesson_translations');
        Schema::dropIfExists('lessons');
    }
};
