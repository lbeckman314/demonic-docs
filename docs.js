import CodeMirror from 'codemirror';
import 'codemirror/mode/python/python.js';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/mode/markdown/markdown.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/theme/dracula.css';
import 'codemirror/lib/codemirror.css';
import './demo.css';

import {bootup} from './demo.bundle.js';

export {termInit};

document.addEventListener("DOMContentLoaded", () => {
    console.log('Converting to codemirror.');
    pandoc_to_codemirror();
    let sourced = false;
    document.getElementById('edit-source').onclick = () => {
        console.log('click');
        if (! sourced) {
            source();
            sourced = true;
        }
    };
});

function source() {
    let source = new Request('docs-demonstration.md');

    const source_container = document.createElement('div');
    const source_header = document.createElement('h2');
    source_header.innerText = 'Source';
    source_header.id = source_header.innerText.toLowerCase();
    source_container.id = 'source_container';
    document.getElementsByTagName('body')[0].appendChild(source_container);
    source_container.before(source_header);

    fetch(source)
        .then(response => response.text())
        .then(data => {
            let editor = CodeMirror(source_container, {
                value: data,
                mode:  "markdown",
                theme: "dracula",
                lineNumbers: true,
                viewportMargin: Infinity,
                lineWrapping: true,
            });

            // compile/run button
            let buttons = document.createElement('div');
            buttons.className ='buttons';

            let run = document.createElement('button');
            run.textContent = '▶';
            run.onclick = (element) => {
                Docs.termInit(element.target);
            }
            buttons.appendChild(run);

            let child = source_container.childNodes[0];
            source_container.insertBefore(buttons, child);
        });
}

// markdown -> html -> codemirror converters
function pandoc_to_codemirror() {
    let i = 1;

    // cb = "codeblock"
    let identifier = document.getElementById(`cb${i}`);
    console.log('identifier:', identifier);
    while (identifier) {
        let myTextArea = identifier.childNodes[0];

        // mode
        let mode = myTextArea.classList[1];
        if (mode == 'c') {
            mode = 'text/x-csrc';
        }

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

        console.log('identifier:', identifier);
        console.log('mode:', mode);
        console.log('editor:', editor);

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
            Docs.termInit(element.target);
        }
        buttons.appendChild(run);

        let child = identifier.childNodes[0];
        identifier.insertBefore(buttons, child);

        i += 1;
        identifier = document.getElementById(`cb${i}`);
    }
}

function jekyll_to_codemirror() {

}

function org_to_codemirror() {

}

// starts up the websocket
function termInit(element) {
    console.log('element:', element);
    let ed_parent = element.parentNode.parentNode;
    let ed = element.parentNode.parentNode.childNodes[1].CodeMirror;
    let code = ed.getValue();

    let language = ed.getMode().name;
    let terminal;

    if (! ed_parent.querySelector('#terminal')) {
        terminal = document.createElement('div');
        terminal.id = 'terminal';
        console.log('terminal:', terminal);

        let terminals = document.createElement('pre');
        terminals.className = 'terminals';
        terminals.tabindex = 0;
        terminals.contentEditable = true;

        terminal.appendChild(terminals);
        ed_parent.appendChild(terminal);
        console.log('terminal:', terminal);
        terminal = terminal.childNodes[0];
    }
    else {
        terminal = ed_parent.querySelector('#terminal').childNodes[0]
    }

    let args = {
        mode: 'code',
        code: code,
        language: language,
        terminal: terminal,
    }

    bootup(args);
}

