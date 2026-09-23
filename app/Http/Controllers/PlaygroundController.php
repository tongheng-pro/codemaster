<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlaygroundController extends Controller
{
    /**
     * Display the code playground sandbox.
     */
    public function index(Request $request): Response
    {
        $templates = [
            'html_basic' => [
                'title' => 'HTML5 Starter',
                'html' => "<div class=\"card\">\n  <h1>Welcome to CodeMaster</h1>\n  <p>Edit this HTML code and click Run!</p>\n  <button onclick=\"alert('Hello from CodeMaster!')\">Click Me</button>\n</div>",
                'css' => ".card {\n  max-width: 400px;\n  margin: 30px auto;\n  padding: 24px;\n  border-radius: 16px;\n  background: #ffffff;\n  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);\n  text-align: center;\n}\nh1 {\n  color: #059669;\n  font-size: 24px;\n  margin-bottom: 8px;\n}\np {\n  color: #64748b;\n  font-size: 14px;\n}\nbutton {\n  margin-top: 16px;\n  padding: 10px 20px;\n  background: #059669;\n  color: white;\n  border: none;\n  border-radius: 8px;\n  font-weight: bold;\n  cursor: pointer;\n}",
                'js' => "console.log('Playground loaded successfully!');",
            ],
            'counter_app' => [
                'title' => 'Interactive Counter',
                'html' => "<div class=\"counter-box\">\n  <h2>Interactive Counter</h2>\n  <div id=\"count\" class=\"number\">0</div>\n  <div class=\"btn-group\">\n    <button id=\"dec\">-</button>\n    <button id=\"reset\">Reset</button>\n    <button id=\"inc\">+</button>\n  </div>\n</div>",
                'css' => ".counter-box {\n  text-align: center;\n  padding: 30px;\n  font-family: sans-serif;\n}\n.number {\n  font-size: 48px;\n  font-weight: bold;\n  color: #2563eb;\n  margin: 20px 0;\n}\n.btn-group button {\n  font-size: 16px;\n  padding: 8px 16px;\n  margin: 0 4px;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n  cursor: pointer;\n}",
                'js' => "let count = 0;\nconst display = document.getElementById('count');\ndocument.getElementById('inc').onclick = () => { count++; display.innerText = count; };\ndocument.getElementById('dec').onclick = () => { count--; display.innerText = count; };\ndocument.getElementById('reset').onclick = () => { count = 0; display.innerText = count; };",
            ],
        ];

        return Inertia::render('Playground', [
            'templates' => $templates,
        ]);
    }
}
