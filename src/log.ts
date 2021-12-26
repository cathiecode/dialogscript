const origin = Date.now();

const loglevel = 200;

const log = (level: number, ...args: any[]) => {
  if (level < loglevel) return;
  console.error(
    `[${(Date.now() - origin).toString().padStart(10)}ms]:`,
    ...args.map((argument) =>
      typeof argument === "function" ? argument() : argument
    )
  );
};

const mark = (...args: any) => log(900, "[MRK]", ...args);

const error = (...args: any) => log(400, "[ERR]", ...args);

const warn = (...args: any) => log(300, "[WRN]", ...args);

const info = (...args: any) => log(200, "[INF]", ...args);

const debug = (...args: any) => log(100, "[DBG]", ...args);

export { mark, error, warn, info, debug };
