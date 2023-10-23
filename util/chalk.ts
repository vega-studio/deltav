export const chalk = {
  cyan: (...text: string[]) => `\x1b[36m${text.join(" ")}\x1b[0m`,
  red: (...text: string[]) => `\x1b[31m${text.join(" ")}\x1b[0m`,
  yellow: (...text: string[]) => `\x1b[33m${text.join(" ")}\x1b[0m`,
  green: (...text: string[]) => `\x1b[32m${text.join(" ")}\x1b[0m`,
  blue: (...text: string[]) => `\x1b[34m${text.join(" ")}\x1b[0m`,
  magenta: (...text: string[]) => `\x1b[35m${text.join(" ")}\x1b[0m`,
  cyanBright: (...text: string[]) => `\x1b[96m${text.join(" ")}\x1b[0m`,
  redBright: (...text: string[]) => `\x1b[91m${text.join(" ")}\x1b[0m`,
  yellowBright: (...text: string[]) => `\x1b[93m${text.join(" ")}\x1b[0m`,
  greenBright: (...text: string[]) => `\x1b[92m${text.join(" ")}\x1b[0m`,
  blueBright: (...text: string[]) => `\x1b[94m${text.join(" ")}\x1b[0m`,
  magentaBright: (...text: string[]) => `\x1b[95m${text.join(" ")}\x1b[0m`,
  whiteBright: (...text: string[]) => `\x1b[97m${text.join(" ")}\x1b[0m`,
  gray: (...text: string[]) => `\x1b[90m${text.join(" ")}\x1b[0m`,
  grey: (...text: string[]) => `\x1b[90m${text.join(" ")}\x1b[0m`,
  white: (...text: string[]) => `\x1b[37m${text.join(" ")}\x1b[0m`,
  black: (...text: string[]) => `\x1b[30m${text.join(" ")}\x1b[0m`,
  blackBright: (...text: string[]) => `\x1b[90m${text.join(" ")}\x1b[0m`,
  bgCyan: (...text: string[]) => `\x1b[46m${text.join(" ")}\x1b[0m`,
  bgRed: (...text: string[]) => `\x1b[41m${text.join(" ")}\x1b[0m`,
  bgYellow: (...text: string[]) => `\x1b[43m${text.join(" ")}\x1b[0m`,
  bgGreen: (...text: string[]) => `\x1b[42m${text.join(" ")}\x1b[0m`,
  bgBlue: (...text: string[]) => `\x1b[44m${text.join(" ")}\x1b[0m`,
  bgMagenta: (...text: string[]) => `\x1b[45m${text.join(" ")}\x1b[0m`,
  bgCyanBright: (...text: string[]) => `\x1b[106m${text.join(" ")}\x1b[0m`,
  bgRedBright: (...text: string[]) => `\x1b[101m${text.join(" ")}\x1b[0m`,
  bgYellowBright: (...text: string[]) => `\x1b[103m${text.join(" ")}\x1b[0m`,
  bgGreenBright: (...text: string[]) => `\x1b[102m${text.join(" ")}\x1b[0m`,
  bgBlueBright: (...text: string[]) => `\x1b[104m${text.join(" ")}\x1b[0m`,
  bgMagentaBright: (...text: string[]) => `\x1b[105m${text.join(" ")}\x1b[0m`,
  cyanBrightBold: (...text: string[]) =>
    `\x1b[96m\x1b[1m${text.join(" ")}\x1b[0m`,
  redBrightBold: (...text: string[]) =>
    `\x1b[91m\x1b[1m${text.join(" ")}\x1b[0m`,
  yellowBrightBold: (...text: string[]) =>
    `\x1b[93m\x1b[1m${text.join(" ")}\x1b[0m`,
  greenBrightBold: (...text: string[]) =>
    `\x1b[92m\x1b[1m${text.join(" ")}\x1b[0m`,
  blueBrightBold: (...text: string[]) =>
    `\x1b[94m\x1b[1m${text.join(" ")}\x1b[0m`,
  magentaBrightBold: (...text: string[]) =>
    `\x1b[95m\x1b[1m${text.join(" ")}\x1b[0m`,
  whiteBrightBold: (...text: string[]) =>
    `\x1b[97m\x1b[1m${text.join(" ")}\x1b[0m`,
  grayBrightBold: (...text: string[]) =>
    `\x1b[90m\x1b[1m${text.join(" ")}\x1b[0m`,
  greyBrightBold: (...text: string[]) =>
    `\x1b[90m\x1b[1m${text.join(" ")}\x1b[0m`,
  whiteBold: (...text: string[]) => `\x1b[37m\x1b[1m${text.join(" ")}\x1b[0m`,
  blackBold: (...text: string[]) => `\x1b[30m\x1b[1m${text.join(" ")}\x1b[0m`,
  blackBrightBold: (...text: string[]) =>
    `\x1b[90m\x1b[1m${text.join(" ")}\x1b[0m`,
};
