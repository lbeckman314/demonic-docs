---
title: demonic-docs demonstration
---

This is a demonstration of the [demonic](https://github.com/lbeckman314/demonic) project, specifically by running editable code snippets from a markdown-converted document.

[demonic](https://github.com/lbeckman314/demonic) was inspired by [mdbook](https://github.com/rust-lang-nursery/mdBook), which is a great Rust documentation project. In mdbook, you can edit and run Rust code right from the document (e.g. [Hello World](https://doc.rust-lang.org/rust-by-example/hello.html#hello-world))! I really liked this feature, but wanted to be able to send input back to the running process.

[demonic-web](https://github.com/lbeckman314/demonic/demonic-web) allows one to do this, and [demonic-docs](https://github.com/lbeckman314/demonic/demonic-docs) integrates it with html-ized markdown documents. Go ahead and play around and edit any of the code blocks below, and click on the '▶' button to run them!


## C

```c
#include <stdio.h>

int main(int argc, char** argv) {
    fprintf(stderr, "%s", "Enter your name: ");
    char name[100];
    scanf("%s", name);

    fprintf(stderr, "Hello %s!\n", name);
    return 0;
}
```

## C++

```c++
#include <iostream>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::string;

int main(int argc, char** argv) {
    string name;
    cout << "What is your name? ";
    cin >> name;
    cout << "Hello " << name << "!" << endl;
}
```

## Go

```go
package main

import (
    "fmt"
    "bufio"
    "os"
    "strings"
)

func main() {
    fmt.Print("What is your name? ")
    reader := bufio.NewReader(os.Stdin)
    name,_ := reader.ReadString('\n')
    name = strings.Replace(name, "\n", "", -1);
    fmt.Printf("Hello %s!\n", name)
}
```

## Java

```java
import java.util.Scanner;

public class Hello {
    public static void main(String[] args) {
        Scanner reader = new Scanner(System.in);
        System.out.print("What is your name? ");
        String name = reader.nextLine();
        System.out.println("Hello " + name + "!");
        reader.close();
    }
}
```

## JavaScript (Node.js)

```javascript
const readline = require('readline');

const readline_interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline_interface.question('What is your name? ', name => {
    console.log(`Hello ${name}!`);

    readline_interface.close();
    process.exit();
})
```

## Python

```python
def greet():
    name = input('Enter your name: ')
    print('Hello', name)

if __name__ == '__main__':
    greet()
```

## Racket

```scheme
#lang racket

(define (greet)
  (display "Enter your name: ")
  (printf "Hello, ~a!\n"
          (read-line (current-input-port) 'any)))

(greet)
```

## Ruby

```ruby
def greet()
  print 'What is your name ? '
  STDOUT.flush
  name = gets
  name = name.chomp
  puts 'Hello ' + name + '!'
end

greet()
```

## Rust

```rust
use std::io::stdin;
use std::io::stdout;
use std::io::Write;

fn greet() {
    let mut name = String::new();
    print!("What is your name? ");
    let _ = stdout().flush();
    stdin().read_line(&mut name)
           .ok()
           .expect("Error in reading stdin.");

    if let Some('\n') = name.chars().next_back() {
        name.pop();
    }
    println!("Hello {}!", name);
}

fn main() {
    greet();
}
```

## Shell

```sh
#!/bin/sh

greet() {
    read -p "What is your name? " name
    echo "Hello $name"
}

greet
```

## Support and Roadmap

This project aims to allow unmodified markdown files to have editable and runnable code blocks. But there needs to be a way for users to tell which program blocks they want to run and which they don't. Unfortunately, this requires a modification to the markdown files! In this instance, the following markdown code had a ".norun" class addition, which tells demonic not to add a "▶" button to the code block.

```{.markdown .norun}
    ```{.python .norun}
    print("Don't run me!")
    ```
```

```{.python .norun}
print("Don't run me!")
```

Markdown files converted by [Pandoc](https://pandoc.org/) are the only supported format currently, but I'd like to add lots of others! I'd like to add the following features:

- Add more documentation. This is a documentation project at heart!
- Adding more languages! This should be forthcoming. Stay tuned!
- Being able to make code blocks "non-runnable" by default.
- Compiling/running multiple files. This may include using the [multiple buffer functionality](https://codemirror.net/demo/buffers.html) of CodeMirror.
- Jekyll-converted markdown documents.
- Org-mode HTML-ized documents.
- Mdbook-converted markdown documents.
- Import/export ability.
- Being able to switch modes for each buffer. This should be made a little easier by CodeMirror's [ability](https://codemirror.net/demo/changemode.html) to do just that.
- Having the option to run the code block converter from the command line i.e. not only at "runtime" as it currently does).
- Having the option to choose between [CodeMirror](https://codemirror.net/) and [Ace](https://ace.c9.io/) for the online editors.
- If you have any other suggestions, let me know at [this](https://github.com/lbeckman314/demonic-server/issues) issue reporter or by e-mail. I'm available at [liam@liambeckman.com](mailto:liam@liambeckman.com) : )

Adding support requires playing around with the resulting DOM structure of each converter and file type, and being able to extract the `language` and `code` of each code block.

