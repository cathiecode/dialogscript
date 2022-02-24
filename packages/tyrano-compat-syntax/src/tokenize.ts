interface StringReaderResult {
  row: number;
  column: number;
  character: string;
}

class StringReader implements Iterator<StringReaderResult> {
  row: number = 0;
  column: number = 0;
  done: boolean = false;
  private iterator: Iterator<string>;
  private nextBuffer: IteratorResult<string> | undefined;

  next = this.consume;

  constructor(source: string) {
    this.iterator = source[Symbol.iterator]();
  }

  consume(): IteratorResult<StringReaderResult, StringReaderResult> {
    let next;
    if (this.nextBuffer) {
      next = this.nextBuffer;
      this.nextBuffer = undefined;
    } else {
      next = this.iterator.next();
    }

    if (next.done) {
      this.done = true;
    }

    if (next.value === "\n") {
      this.row++;
      this.column = 0;
    }

    return {
      value: {
        row: this.row,
        column: this.column++,
        character: next.value,
      },
      done: next.done ?? false,
    };
  }

  lookNext(): IteratorResult<string> {
    if (this.nextBuffer) {
      return this.nextBuffer;
    }
    this.nextBuffer = this.iterator.next();
    return this.nextBuffer;
  }
}

type TextToken = {
  type: "text";
  text: string;
};

function tokenizeText(reader: StringReader): TextToken | undefined {
  let text = "";
  let next;
  let isEscaping = false;
  // FIXME: 先読みでdoneかどうか見てるので最後にdoneだけ帰ってくるやつを捉えられない
  while (!(next = reader.lookNext()).done) {
    if (isEscaping) {
      text += reader.consume().value.character;
      isEscaping = false;
      continue;
    }

    if (["[", "\n", ";"].includes(next.value)) {
      break;
    }

    if (next.value === "\\") {
      reader.consume().value.character;
      isEscaping = true;
      continue;
    }

    text += reader.consume().value.character;
  }

  if (text === "") {
    return undefined;
  } else {
    return {
      type: "text",
      text: text,
    };
  }
}

export default function tokenize(input: string) {
  const tokens = [];

  const reader = new StringReader(input);

  let token = undefined;
  while ((token = tokenizeText(reader))) {
    tokens.push(token);
  }

  if (!reader.done) {
    throw new Error(`Syntax error at ${reader.row}:${reader.column}`);
  }

  return tokens;
}
