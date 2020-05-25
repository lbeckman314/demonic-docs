import CodeMirror from 'codemirror/lib/codemirror.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/mode/go/go.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/markdown/markdown.js';
import 'codemirror/mode/python/python.js';
import 'codemirror/mode/ruby/ruby.js';
import 'codemirror/mode/rust/rust.js';
import 'codemirror/theme/dracula.css';
import {bootup} from './demo-web.bundle.js';

document.addEventListener("DOMContentLoaded", () => {
    pandocToCodemirror();
    let sourced = false;
    document.getElementById('edit-source').onclick = () => {
        if (!sourced) {
            source();
            sourced = true;
        }
    };
});

function source() {
    let url = window.location.href;
    url = url.split('/');
    url = url[url.length - 1];
    url = url.replace('html', 'md');
    const source = url;

    const sourceContainer = document.createElement('div');
    sourceContainer.id = 'sourceContainer';
    document.getElementsByTagName('body')[0].appendChild(sourceContainer);

    const sourceHeader = document.createElement('h2');
    sourceHeader.innerText = 'Source';
    sourceHeader.id = sourceHeader.innerText.toLowerCase();
    sourceContainer.before(sourceHeader);

    fetch(source)
        .then(response => response.text())
        .then(data => {
            const editor = CodeMirror(sourceContainer, {
                value: data,
                mode:  "markdown",
                theme: "dracula",
                lineNumbers: true,
                viewportMargin: Infinity,
                lineWrapping: true,
            });

            // Compile/run button.
            let buttons = document.createElement('div');
            buttons.className ='buttons';

            let run = document.createElement('button');
            run.textContent = '▶';
            run.onclick = (element) => {
                termInit(element.target);
            }
            buttons.appendChild(run);

            const child = sourceContainer.childNodes[0];
            sourceContainer.insertBefore(buttons, child);
        });
}

function convertToCm(mode) {
    if (mode == 'c') {
       return 'text/x-csrc';
    }
    else if (mode == 'c++' || mode == 'cpp') {
        return 'text/x-c++src';
    }
    else if (mode == 'java') {
        return 'text/x-java';
    }
    return mode;
}

function convertFromCm(mode) {

    if (mode == 'text/x-csrc') {
       return 'c'
    }
    else if (mode == 'text/x-c++src') {
        return 'c++';
    }
    else if (mode == 'text/x-java') {
        return 'java';
    }
    return mode;
}

// markdown -> html -> codemirror converters
function pandocToCodemirror() {
    let i = 1;

    // cb = "codeblock"
    let identifier = document.getElementById(`cb${i}`);
    while (identifier) {
        let myTextArea = identifier.childNodes[0];

        // mode
        let mode = convertToCm(myTextArea.classList[1]);

        // codemirror
        let editor = CodeMirror(function(elt) {
            myTextArea.parentNode.replaceChild(elt, myTextArea);
        }, {
            value: myTextArea.innerText,
            mode: mode,
            theme: "dracula",
            lineNumbers: true,
            viewportMargin: Infinity,
            lineWrapping: true,
        });

        // compile/run button
        if (myTextArea.classList.contains('norun')) {
            i += 1;
            identifier = document.getElementById(`cb${i}`);
            continue;
        }

        let buttons = document.createElement('div');
        buttons.className = 'buttons';

        let run = document.createElement('button');
        run.textContent = '▶';
        run.onclick = (element) => {
            termInit(element.target);
        }
        buttons.appendChild(run);

        let child = identifier.childNodes[0];
        identifier.insertBefore(buttons, child);

        i += 1;
        identifier = document.getElementById(`cb${i}`);
    }
}

// Starts up the websocket.
function termInit(element) {
    const edParent = element.parentNode.parentNode;
    const ed = element.parentNode.parentNode.childNodes[1].CodeMirror;
    const code = ed.getValue();

    const lang = convertFromCm(ed.getOption('mode'));
    const domain = ed.domain;
    let elem = edParent.querySelector('#terminal');

    if (!elem) {
        elem = document.createElement('div');
        elem.id = 'terminal';
        edParent.appendChild(elem);
    }

    let args = {
        lang: lang,
        code: code,
        elem: elem,
    }

    bootup(args);
}

