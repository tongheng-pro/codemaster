<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BookTranslation;
use App\Services\PDF\BookImportService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(BookImportService $service): void
    {
        // 1. Generate a realistic sample PDF with 3 pages covering HTML5 Notes for Professionals
        $storageDir = storage_path('app/private/books/sample');
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0755, true);
        }

        $pdfPath = 'books/sample/html5-notes-for-professionals.pdf';
        $fullPdfPath = storage_path('app/private/' . $pdfPath);

        $samplePdfContent = "%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R 6 0 R 8 0 R] /Count 3 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 260 >> stream
BT
/F1 18 Tf
50 720 Td
(Chapter 1: Getting started with HTML) Tj
/F1 14 Tf
0 -40 Td
(Section 1.1: Hello World) Tj
/F1 12 Tf
0 -30 Td
(HTML uses a markup system composed of elements which represent specific content.) Tj
/F1 11 Tf
0 -30 Td
(An element usually consists of an opening tag, a closing tag, and the content in between.) Tj
/F1 10 Tf
0 -35 Td
(<h1>Hello World!</h1>) Tj
0 -20 Td
(<p>This is a simple paragraph.</p>) Tj
ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
6 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 7 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
7 0 obj << /Length 240 >> stream
BT
/F1 14 Tf
50 720 Td
(Section 1.2: HTML Paragraphs) Tj
/F1 12 Tf
0 -30 Td
(The HTML p element defines a paragraph in the webpage.) Tj
/F1 11 Tf
0 -30 Td
(Note: The browser will remove any extra spaces and extra lines when the page is displayed.) Tj
/F1 10 Tf
0 -35 Td
(<p>This is a paragraph with content.</p>) Tj
ET
endstream endobj
8 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 9 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
9 0 obj << /Length 270 >> stream
BT
/F1 18 Tf
50 720 Td
(Chapter 2: Doctypes) Tj
/F1 14 Tf
0 -40 Td
(Section 2.1: Adding the Doctype) Tj
/F1 12 Tf
0 -30 Td
(Doctypes help browsers to understand the version of HTML the document is written in.) Tj
/F1 11 Tf
0 -30 Td
(The <!DOCTYPE html> declaration should always be included at the top of the HTML document.) Tj
/F1 10 Tf
0 -35 Td
(<!DOCTYPE html>) Tj
0 -20 Td
(<html lang=\"en\">) Tj
ET
endstream endobj
xref
0 10
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000127 00000 n 
0000000239 00000 n 
0000000551 00000 n 
0000000624 00000 n 
0000000736 00000 n 
0000001028 00000 n 
0000001140 00000 n 
trailer << /Size 10 /Root 1 0 R >>
startxref
1462
%%EOF";

        file_put_contents($fullPdfPath, $samplePdfContent);

        // 2. Create Book Record
        $book = Book::firstOrCreate(
            ['slug' => 'html5-notes-for-professionals'],
            [
                'author' => 'Stack Overflow Contributors',
                'original_language' => 'en',
                'original_pdf_path' => $pdfPath,
                'status' => 'uploaded',
                'processing_progress' => 0,
                'is_published' => true,
            ]
        );

        BookTranslation::firstOrCreate(
            ['book_id' => $book->id, 'locale' => 'en'],
            [
                'title' => 'HTML5 Notes for Professionals',
                'description' => 'Comprehensive HTML5 reference and guide compiled from Stack Overflow documentation.',
            ]
        );

        BookTranslation::firstOrCreate(
            ['book_id' => $book->id, 'locale' => 'km'],
            [
                'title' => 'កំណត់ចំណាំ HTML5 សម្រាប់អ្នកជំនាញ',
                'description' => 'ឯកសារយោង និងមគ្គុទ្ទេសក៍ HTML5 ដ៏ទូលំទូលាយដែលដកស្រង់ចេញពីឯកសារ Stack Overflow។',
            ]
        );

        // 3. Run extraction and structuring
        $service->extractPages($book);
        $service->structureBook($book, true);

        // Mark published
        $book->update(['is_published' => true]);
        $book->chapters()->update(['status' => 'published']);
        foreach ($book->chapters as $c) {
            $c->sections()->update(['status' => 'published']);
        }
    }
}

