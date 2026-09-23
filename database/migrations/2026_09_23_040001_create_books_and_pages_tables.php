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
        // 1. Books table
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('author')->nullable();
            $table->string('original_language', 10)->default('en');
            $table->string('cover_image')->nullable();
            $table->string('original_pdf_path');
            $table->integer('total_pages')->default(0);
            $table->integer('processed_pages')->default(0);
            $table->string('status', 30)->default('uploaded'); // uploaded, extracting, ocr_processing, ai_processing, structuring, saving, completed, failed
            $table->integer('processing_progress')->default(0); // 0 - 100
            $table->string('current_step')->nullable();
            $table->text('error_message')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });

        // 2. Book translations
        Schema::create('book_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->string('locale', 10);
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['book_id', 'locale']);
        });

        // 3. Book pages
        Schema::create('book_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->integer('page_number');
            $table->longText('extracted_text')->nullable();
            $table->longText('ocr_text')->nullable();
            $table->string('page_image_path')->nullable();
            $table->boolean('is_scanned')->default(false);
            $table->string('processing_status', 30)->default('pending'); // pending, extracted, structured, failed
            $table->float('confidence')->default(1.0);
            $table->boolean('needs_review')->default(false);
            $table->timestamps();

            $table->unique(['book_id', 'page_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_pages');
        Schema::dropIfExists('book_translations');
        Schema::dropIfExists('books');
    }
};

