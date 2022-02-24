export interface StringReaderResult {
  row: number;
  column: number;
  character: string;
}

export default class StringReader implements Iterator<StringReaderResult> {
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

    let row, column;

    if (next.value === "\n") {
      this.column = 0;
      row = this.row++;
      column = 0;
    } else {
      row = this.row;
      column = this.column++;
    }

    return {
      value: {
        row: row,
        column: column,
        character: next.value,
      },
      done: next.done ?? false,
    };
  }

  lookNext(): IteratorResult<string, string> {
    if (this.nextBuffer) {
      return this.nextBuffer;
    }
    this.nextBuffer = this.iterator.next();
    return this.nextBuffer;
  }
}
