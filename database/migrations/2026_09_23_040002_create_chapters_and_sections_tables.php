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
        // 1. Chapters
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->integer('chapter_number')->default(1);
            $table->string('slug');
            $table->integer('sort_order')->default(0);
            $table->integer('start_page')->nullable();
            $table->integer('end_page')->nullable();
            $table->string('status', 30)->default('draft'); // draft, review, approved, published
            $table->timestamps();

            $table->index(['book_id', 'sort_order']);
        });

        // 2. Chapter translations
        Schema::create('chapter_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained('chapters')->onDelete('cascade');
            $table->string('locale', 10);
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['chapter_id', 'locale']);
        });

        // 3. Sections
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained('chapters')->onDelete('cascade');
            $table->string('section_number', 30)->nullable(); // e.g. "1.1", "1.2"
            $table->string('slug');
            $table->integer('sort_order')->default(0);
            $table->integer('page_number')->nullable(); // Original PDF page reference
            $table->string('status', 30)->default('draft'); // draft, review, approved, published
            $table->timestamps();

            $table->index(['chapter_id', 'sort_order']);
            $table->index('page_number');
        });

        // 4. Section translations
        Schema::create('section_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained('sections')->onDelete('cascade');
            $table->string('locale', 10);
            $table->string('title');
            $table->text('summary')->nullable();
            $table->timestamps();

            $table->unique(['section_id', 'locale']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('section_translations');
        Schema::dropIfExists('sections');
        Schema::dropIfExists('chapter_translations');
        Schema::dropIfExists('chapters');
    }
};

