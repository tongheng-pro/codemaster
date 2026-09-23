/**
 * Runs JavaScript, Python (Pyodide) and SQL (sql.js) in a Web Worker, entirely in the visitor's browser.
 *
 * - The worker keeps the page responsive while code runs.
 * - Runs that take too long (e.g. an infinite loop) terminate the worker; a fresh one is created next time.
 * - Python and SQLite are downloaded from the jsDelivr CDN only the first time they are used.
 */

export type RunnableMode = 'javascript' | 'python' | 'sql';

export interface SqlResultTable {
    columns: string[];
    values: Array<Array<string | number | null>>;
}

export interface RunResult {
    stdout: string;
    stderr: string;
    tables: SqlResultTable[];
    durationMs: number;
    timedOut: boolean;
}

const PYODIDE_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
const SQLJS_BASE = 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/';

const RUN_TIMEOUT_MS = 15_000;
const FIRST_PYTHON_TIMEOUT_MS = 90_000; // includes downloading Python (~10 MB) the first time

// Worker source, kept inline so no extra build configuration is needed
const WORKER_SOURCE = `
let pyodideReady = null;
let sqlReady = null;

function format(value) {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.stack || value.message;
  try { return JSON.stringify(value, null, 2); } catch (e) { return String(value); }
}

async function runJavaScript(code, stdout, stderr) {
  const write = (target) => (...args) => target.push(args.map(format).join(' '));
  const sandboxConsole = {
    log: write(stdout), info: write(stdout), debug: write(stdout), table: write(stdout),
    warn: write(stderr), error: write(stderr),
  };
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  await new AsyncFunction('console', code)(sandboxConsole);
}

async function runPython(code, stdout, stderr) {
  if (!pyodideReady) {
    self.postMessage({ type: 'status', message: 'Loading Python… (first run only)' });
    importScripts('${PYODIDE_BASE}pyodide.js');
    pyodideReady = loadPyodide({ indexURL: '${PYODIDE_BASE}' });
  }
  const pyodide = await pyodideReady;
  pyodide.setStdout({ batched: (text) => stdout.push(text) });
  pyodide.setStderr({ batched: (text) => stderr.push(text) });
  pyodide.setStdin({ error: true });
  self.postMessage({ type: 'status', message: 'Running…' });
  await pyodide.loadPackagesFromImports(code);
  await pyodide.runPythonAsync(code);
}

async function runSql(code) {
  if (!sqlReady) {
    self.postMessage({ type: 'status', message: 'Loading SQLite… (first run only)' });
    importScripts('${SQLJS_BASE}sql-wasm.js');
    sqlReady = initSqlJs({ locateFile: (file) => '${SQLJS_BASE}' + file });
  }
  const SQL = await sqlReady;
  const db = new SQL.Database();
  try {
    return db.exec(code);
  } finally {
    db.close();
  }
}

self.onmessage = async (event) => {
  const { id, mode, code } = event.data;
  const stdout = [];
  const stderr = [];
  let tables = [];
  const startedAt = performance.now();
  try {
    if (mode === 'javascript') await runJavaScript(code, stdout, stderr);
    else if (mode === 'python') await runPython(code, stdout, stderr);
    else if (mode === 'sql') tables = await runSql(code);
  } catch (error) {
    let message = error && error.message ? error.message : String(error);
    // Python tracebacks start inside Pyodide's internals; keep only the frames from the student's code
    const userFrame = message.indexOf('File "<exec>"');
    if (mode === 'python' && userFrame !== -1) {
      message = 'Traceback (most recent call last):\\n  ' + message.slice(userFrame);
    }
    // Book examples often use the page (document, window, alert), which a worker does not have
    if (mode === 'javascript' && /\\b(document|window|alert|localStorage)\\b is not defined/.test(message)) {
      message += '\\nThis example uses a web page (DOM). Try it in the Playground\\'s "Web page" mode.';
    }
    stderr.push(message);
  }
  self.postMessage({
    type: 'result',
    id,
    stdout: stdout.join('\\n'),
    stderr: stderr.join('\\n'),
    tables,
    durationMs: Math.round(performance.now() - startedAt),
  });
};
`;

let worker: Worker | null = null;
let workerUrl: string | null = null;
let nextRunId = 1;
let isPythonLoaded = false;

function getWorker(): Worker {
    if (!worker) {
        workerUrl = workerUrl ?? URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }));
        worker = new Worker(workerUrl);
    }
    return worker;
}

function resetWorker(): void {
    worker?.terminate();
    worker = null;
    isPythonLoaded = false; // a new worker has to load Python again
}

/**
 * Run code and resolve with its output. `onStatus` receives progress messages such as "Loading Python…".
 */
export function runCode(mode: RunnableMode, code: string, onStatus?: (message: string) => void): Promise<RunResult> {
    const runWorker = getWorker();
    const id = nextRunId++;
    const timeoutMs = mode === 'python' && !isPythonLoaded ? FIRST_PYTHON_TIMEOUT_MS : RUN_TIMEOUT_MS;

    return new Promise((resolve) => {
        const timer = window.setTimeout(() => {
            runWorker.removeEventListener('message', onMessage);
            resetWorker();
            resolve({
                stdout: '',
                stderr: `Stopped after ${timeoutMs / 1000} seconds. Check for an infinite loop.`,
                tables: [],
                durationMs: timeoutMs,
                timedOut: true,
            });
        }, timeoutMs);

        function onMessage(event: MessageEvent) {
            const data = event.data;
            if (data.type === 'status') {
                onStatus?.(data.message);
                return;
            }
            if (data.type !== 'result' || data.id !== id) return;

            window.clearTimeout(timer);
            runWorker.removeEventListener('message', onMessage);
            if (mode === 'python') isPythonLoaded = true;
            resolve({ stdout: data.stdout, stderr: data.stderr, tables: data.tables ?? [], durationMs: data.durationMs, timedOut: false });
        }

        runWorker.addEventListener('message', onMessage);
        runWorker.postMessage({ id, mode, code });
    });
}
