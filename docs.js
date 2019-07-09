import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/mode/go/go.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/markdown/markdown.js';
import 'codemirror/mode/python/python.js';
import 'codemirror/mode/ruby/ruby.js';
import 'codemirror/mode/rust/rust.js';
import 'codemirror/theme/dracula.css';
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

    const ev = `
const name = prompt('What is your name? ');
console.log(\`Hello \${name}!\`);
`

    //eval(ev);
});

function source() {
    let source = new Request('docs-demonstration.md');
    let url = window.location.href;
    url = url.split('/');
    url = url[url.length - 1];
    url = url.replace('html', 'md');
    source = url;

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
        let domain;
        if (myTextArea.classList[2]) {
            domain = myTextArea.classList[2];
        }
        console.log('myTextArea:', myTextArea.classList);
        if (mode == 'c') {
            mode = 'text/x-csrc';
        }
        else if (mode == 'c++' || mode == 'cpp') {
            mode = 'text/x-c++src';
        }
        else if (mode == 'java') {
            mode = 'text/x-java';
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

        if (mode === 'javascript' && domain === 'browser') {
            console.log('javascript mode.');
            editor.domain = 'browser';
        }

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

    let language = ed.getOption('mode');
    console.log('language:', language);
    let domain = ed.domain;
    console.log('domain:', domain);
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
        domain, domain,
    }

    bootup(args);
}


function openBuffer(name, text, mode) {
  buffers[name] = CodeMirror.Doc(text, mode);
  var opt = document.createElement("option");
  opt.appendChild(document.createTextNode(name));
  sel_top.appendChild(opt);
}

function newBuf(where) {
  var name = prompt("Name for the buffer", "*scratch*");
  if (name == null) return;
  if (buffers.hasOwnProperty(name)) {
    alert("There's already a buffer by that name.");
    return;
  }
  openBuffer(name, "", "javascript");
  selectBuffer(where == "top" ? ed_top : ed_bot, name);
  sel.value = name;
}

function selectBuffer(editor, name) {
  var buf = buffers[name];
  if (buf.getEditor()) buf = buf.linkedDoc({sharedHist: true});
  var old = editor.swapDoc(buf);
  var linked = old.iterLinkedDocs(function(doc) {linked = doc;});
  if (linked) {
    // Make sure the document in buffers is the one the other view is looking at
    for (var name in buffers) if (buffers[name] == old) buffers[name] = linked;
    old.unlinkDoc(linked);
  }
  editor.focus();
}

function nodeContent(id) {
  var node = document.getElementById(id), val = node.textContent || node.innerText;
  val = val.slice(val.match(/^\s*/)[0].length, val.length - val.match(/\s*$/)[0].length) + "\n";
  return val;
}
