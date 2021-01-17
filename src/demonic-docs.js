export { run };
import CodeMirror from 'codemirror/lib/codemirror.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/mode/go/go.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/markdown/markdown.js';
import 'codemirror/mode/python/python.js';
import 'codemirror/mode/ruby/ruby.js';
import 'codemirror/mode/rust/rust.js';
import 'codemirror/mode/scheme/scheme.js';
import 'codemirror/mode/shell/shell.js';
import 'codemirror/theme/dracula.css';
import '../assets/demonic-docs.css';
import * as DemonicWeb from 'demonic-web/dist/demonic-web.bundle.js';

function convertToCodemirror(lang) {
    switch(lang) {
        case 'c': return 'text/x-csrc';
        case 'c++':
        case 'cpp': return 'text/x-c++src';
        case 'sh': return 'shell';
        case 'java': return 'text/x-java';
        default: return lang;
    }
}

function convertFromCodemirror(lang) {
    switch(lang) {
        case 'text/x-csrc': return 'c';
        case 'text/x-c++src': return 'c++';
        case 'text/x-java': return 'java';
        default: return lang;
    }
}

function run(args) {
    const run = (typeof args.run == 'undefined') ? true : args.run;

    document.addEventListener("DOMContentLoaded", () => {
        switch(args.mode) {
            case 'jekyll':
                jekyllToCm(run);
                break;
            case 'pandoc':
                pandocToCm(run);
                break;
        }
    });
}

// markdown -> html -> codemirror converters
function pandocToCm(run) {
    let codeblocks = Array.from(document.getElementsByClassName('sourceCode'))
        .filter(e => e.tagName == 'PRE');
    codeblocks.forEach(codeblock => {
        let code = codeblock.innerText;
        let lang = convertToCodemirror(codeblock.childNodes[0].classList[1]);
        createEditor(code, lang, codeblock, run);
    });
}

function jekyllToCm(run) {
    let codeblocks = Array.from(document.getElementsByClassName('highlighter-rouge'));
    codeblocks.forEach(codeblock => {
        let code = codeblock.innerText;
        let lang = convertToCodemirror(codeblock.classList[0].replace(/.*-/, ''));
        createEditor(code, lang, codeblock, run);
    });
}

function shouldRun(element, run) {
    if (run && element.classList.contains('norun'))
        return false;

    if (!run && element.classList.contains('run'))
        return true;

    return run;
}

function createEditor(code, lang, element, run) {
    if (!shouldRun(element, run))
        return;

    let demonicDocs = document.createElement('div');
    demonicDocs.classList.add('demonic-docs');
    demonicDocs.classList.add(convertFromCodemirror(lang));
    element.parentElement.insertBefore(demonicDocs, element)
    demonicDocs.appendChild(element);

    let buttons = document.createElement('div');
    buttons.className = 'buttons';
    demonicDocs.appendChild(buttons);

    let undoBtn = document.createElement('button');
    undoBtn.textContent = '↺';
    undoBtn.title = 'Undo changes';
    buttons.appendChild(undoBtn);

    let copyBtn = document.createElement('button');
    copyBtn.textContent = '⧉';
    copyBtn.title = 'Copy to clipboard';
    buttons.appendChild(copyBtn);

    let copyMsg = document.createElement('p');
    copyMsg.className = 'copyMsg hide';
    copyMsg.innerHTML = 'Copied!';
    copyBtn.addEventListener('mouseout', () => copyMsg.classList.add('hide'));
    buttons.appendChild(copyMsg);

    let runBtn = document.createElement('button');
    runBtn.textContent = '▶';
    runBtn.title = 'Run code (Ctrl + Enter)';
    buttons.appendChild(runBtn);

    // Codemirror
    let codeMirror = CodeMirror(elt => {
        element.parentNode.replaceChild(elt, element);
    }, {
        value: code,
        mode: lang,
        theme: "dracula",
        lineNumbers: true,
        viewportMargin: Infinity,
        lineWrapping: true,

        extraKeys: {
            "Ctrl-Enter": (cm) => {
                runCode(cm, cm.getWrapperElement().closest('.demonic-docs'))
            }
        }
    });

    undoBtn.onclick = () => {
        codeMirror.setValue(code);
    };

    copyBtn.onclick = () => {
        copy(codeMirror.getValue());
        copyMsg.classList.remove('hide');
    };

    runBtn.onclick = (e) => {
        runCode(codeMirror, e.target.closest('.demonic-docs'));
    }
}

function copy(text){
    const tmp = document.createElement('textarea');
    tmp.textContent = text;

    const body = document.getElementsByTagName('body')[0];
    body.appendChild(tmp);

    tmp.select();
    document.execCommand('copy');
    tmp.remove();
}

function runCode(codeMirror, element) {
    // Language
    let lang = convertFromCodemirror(codeMirror.getOption('mode'));

    // Check if a demonic-web instance has already been attached to 'element'.
    let demonicWeb = element.demonicWeb;
    if (typeof demonicWeb != 'undefined' && demonicWeb.isOpen()) {
        demonicWeb.send({
            lang: lang,
            data: codeMirror.getValue(),
        });

        return;
    }

    let terminal = document.createElement('div');
    terminal.className = 'demonic-web';
    element.appendChild(terminal);

    // User Prompt
    const GREEN='\x1b[1;32m';
    const NC='\x1b[0m';
    let userPrompt = `${GREEN}>${NC} `;

    demonicWeb = DemonicWeb.run({
        lang: lang,
        data: codeMirror.getValue(),
        elem: terminal,
        userPrompt: userPrompt,
        url: 'ws://localhost:8181',
        write: false,
    });

    element.demonicWeb = demonicWeb;
}

