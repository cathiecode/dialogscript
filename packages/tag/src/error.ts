export class TokenizeError extends Error {
  row: number;
  column: number;
  filename: string | undefined;

  constructor(message: string, row: number, column: number, filename?: string) {
    let position = [];
    if (filename) {
      position.push(filename);
    }
    position.push(row);
    position.push(column);

    super(`${message} at ${position.join(":")}`);
    this.name = "TokenizeError";
    this.row = row;
    this.column = column;
    this.filename = filename;
  }
}
