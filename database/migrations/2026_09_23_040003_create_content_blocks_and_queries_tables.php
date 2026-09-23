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
        // 1. Content blocks
        Schema::create('content_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained('sections')->onDelete('cascade');
            $table->string('type', 40)->default('paragraph'); // paragraph, heading, subheading, definition, example, code, list, quote, note, warning, table, image, exercise, answer, summary
            $table->integer('sort_order')->default(0);
            $table->integer('page_number')->nullable(); // Original PDF page reference
            $table->float('confidence')->default(1.0);
            $table->boolean('needs_review')->default(false);
            $table->json('metadata')->nullable(); // e.g. language, level, table headers, attributes
            $table->timestamps();

            $table->index(['section_id', 'sort_order']);
            $table->index('page_number');
        });

        // 2. Content block translations
        Schema::create('content_block_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('content_block_id')->constrained('content_blocks')->onDelete('cascade');
            $table->string('locale', 10);
            $table->longText('content');
            $table->timestamps();

            $table->unique(['content_block_id', 'locale']);
        });

        // 3. Book queries (for "Ask the Book" grounding & citations)
        Schema::create('book_queries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('question');
            $table->text('answer');
            $table->json('citations')->nullable(); // [{"chapter": 1, "section": "1.1", "page": 2, "text": "..."}]
            $table->string('locale', 10)->default('en');
            $table->timestamps();

            $table->index('book_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_queries');
        Schema::dropIfExists('content_block_translations');
        Schema::dropIfExists('content_blocks');
    }
};

