/**
 * Programming languages supported by the Playground and book code blocks.
 *
 * Every language gets editing and syntax highlighting in Monaco. `runMode` says how (or whether)
 * it can run in the visitor's browser:
 *   - 'web'        HTML page rendered in a sandboxed iframe
 *   - 'javascript' JavaScript with console output
 *   - 'python'     Python via Pyodide (WebAssembly)
 *   - 'sql'        SQLite via sql.js (WebAssembly)
 *   - null         editing only
 */
export type RunMode = 'web' | 'javascript' | 'python' | 'sql' | null;

export interface CodeLanguage {
    id: string;
    label: string;
    /** Monaco language id used for syntax highlighting */
    monaco: string;
    runMode: RunMode;
    sample: string;
}

export const LANGUAGES: CodeLanguage[] = [
    {
        id: 'javascript',
        label: 'JavaScript',
        monaco: 'javascript',
        runMode: 'javascript',
        sample: `const languages = ['HTML', 'CSS', 'JavaScript'];

languages.forEach((name, index) => {
  console.log(\`\${index + 1}. \${name}\`);
});

console.log({ total: languages.length });`,
    },
    {
        id: 'python',
        label: 'Python',
        monaco: 'python',
        runMode: 'python',
        sample: `def greet(name):
    return f"Hello, {name}!"

for name in ["Sophea", "Dara", "Heng"]:
    print(greet(name))

squares = [n * n for n in range(1, 6)]
print("Squares:", squares)`,
    },
    {
        id: 'sql',
        label: 'SQL (SQLite)',
        monaco: 'sql',
        runMode: 'sql',
        sample: `CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, score INTEGER);

INSERT INTO students (name, score) VALUES
  ('Sophea', 92),
  ('Dara', 85),
  ('Heng', 78);

SELECT name, score
FROM students
WHERE score > 80
ORDER BY score DESC;`,
    },
    {
        id: 'typescript',
        label: 'TypeScript',
        monaco: 'typescript',
        runMode: null,
        sample: `interface Student {
  name: string;
  score: number;
}

const students: Student[] = [{ name: 'Sophea', score: 92 }];
console.log(students.map((s) => s.name));`,
    },
    {
        id: 'php',
        label: 'PHP',
        monaco: 'php',
        runMode: null,
        sample: `<?php

$languages = ['PHP', 'Laravel', 'MySQL'];

foreach ($languages as $index => $name) {
    echo ($index + 1) . ". {$name}\\n";
}`,
    },
    {
        id: 'java',
        label: 'Java',
        monaco: 'java',
        runMode: null,
        sample: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeMaster!");
    }
}`,
    },
    {
        id: 'c',
        label: 'C',
        monaco: 'c',
        runMode: null,
        sample: `#include <stdio.h>

int main(void) {
    printf("Hello, CodeMaster!\\n");
    return 0;
}`,
    },
    {
        id: 'cpp',
        label: 'C++',
        monaco: 'cpp',
        runMode: null,
        sample: `#include <iostream>

int main() {
    std::cout << "Hello, CodeMaster!" << std::endl;
    return 0;
}`,
    },
    {
        id: 'csharp',
        label: 'C#',
        monaco: 'csharp',
        runMode: null,
        sample: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, CodeMaster!");
    }
}`,
    },
    {
        id: 'go',
        label: 'Go',
        monaco: 'go',
        runMode: null,
        sample: `package main

import "fmt"

func main() {
    fmt.Println("Hello, CodeMaster!")
}`,
    },
    {
        id: 'rust',
        label: 'Rust',
        monaco: 'rust',
        runMode: null,
        sample: `fn main() {
    let name = "CodeMaster";
    println!("Hello, {}!", name);
}`,
    },
    {
        id: 'ruby',
        label: 'Ruby',
        monaco: 'ruby',
        runMode: null,
        sample: `%w[Ruby Rails Sinatra].each_with_index do |name, index|
  puts "#{index + 1}. #{name}"
end`,
    },
    {
        id: 'kotlin',
        label: 'Kotlin',
        monaco: 'kotlin',
        runMode: null,
        sample: `fun main() {
    val names = listOf("Sophea", "Dara")
    names.forEach { println("Hello, $it!") }
}`,
    },
    {
        id: 'swift',
        label: 'Swift',
        monaco: 'swift',
        runMode: null,
        sample: `let names = ["Sophea", "Dara"]
for name in names {
    print("Hello, \\(name)!")
}`,
    },
    {
        id: 'bash',
        label: 'Bash',
        monaco: 'shell',
        runMode: null,
        sample: `#!/usr/bin/env bash

for name in Sophea Dara Heng; do
  echo "Hello, $name!"
done`,
    },
    {
        id: 'json',
        label: 'JSON',
        monaco: 'json',
        runMode: null,
        sample: `{
  "name": "CodeMaster",
  "languages": ["en", "km"],
  "published": true
}`,
    },
    {
        id: 'yaml',
        label: 'YAML',
        monaco: 'yaml',
        runMode: null,
        sample: `name: CodeMaster
languages:
  - en
  - km
published: true`,
    },
    {
        id: 'markdown',
        label: 'Markdown',
        monaco: 'markdown',
        runMode: null,
        sample: `# CodeMaster

- Learn **HTML**, **CSS** and **JavaScript**
- Practise in the Playground`,
    },
    {
        id: 'xml',
        label: 'XML',
        monaco: 'xml',
        runMode: null,
        sample: `<?xml version="1.0" encoding="UTF-8"?>
<course>
  <title>CodeMaster</title>
</course>`,
    },
];

/** Book code blocks store short names (e.g. "js", "shell"); map them onto registry ids. */
const ALIASES: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    sh: 'bash',
    shell: 'bash',
    'c++': 'cpp',
    'c#': 'csharp',
    cs: 'csharp',
    yml: 'yaml',
    md: 'markdown',
    golang: 'go',
};

export function findLanguage(id: string | null | undefined): CodeLanguage | undefined {
    if (!id) return undefined;
    const key = id.toLowerCase();
    return LANGUAGES.find((language) => language.id === (ALIASES[key] ?? key));
}

/** How a book code block in `languageId` can run, including HTML, which runs as a web page. */
export function runModeFor(languageId: string | null | undefined): RunMode {
    if (languageId?.toLowerCase() === 'html') return 'web';
    return findLanguage(languageId)?.runMode ?? null;
}

/** Monaco language id for highlighting, falling back to the given id (html, css, plaintext...). */
export function monacoLanguageFor(languageId: string | null | undefined): string {
    return findLanguage(languageId)?.monaco ?? languageId ?? 'plaintext';
}
