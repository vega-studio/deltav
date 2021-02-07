/**
 * Performs a splice operation like an array on a string. Does not mutate original string.
 */
function spliceStr(str: string, index: number, count: number, add?: string) {
  // We cannot pass negative indexes directly to the 2nd slicing operation.
  if (index < 0) {
    index = str.length + index;
    if (index < 0) {
      index = 0;
    }
  }

  return str.slice(0, index) + (add || "") + str.slice(index + count);
}

/**
 * Removes comments from a valid shader source string
 */
export function removeComments(str: string): string {
  // We now must count valid context brackets till we find a bracket that would
  // close the context of the main body.
  let insideMultilineComment = false;
  let insideSingleLineComment = false;

  const comments = [];
  let currentMultiline = { start: -1, stop: -1 };
  let currentSingleLine = { start: -1, stop: -1 };

  // When openBracket === close bracket, we have the location of the end of the
  // body of the main method
  for (let i = 0, iMax = str.length; i < iMax; ++i) {
    const char = str[i];
    const nextChar = str[i + 1];

    // Analyze each character for comments and valid bracket contexts
    switch (char) {
      case "/":
        switch (nextChar) {
          case "*":
            if (!insideSingleLineComment && !insideMultilineComment) {
              currentMultiline.start = i;
              insideMultilineComment = true;
              i++;
            }
            break;

          case "/":
            if (!insideMultilineComment && !insideSingleLineComment) {
              currentSingleLine.start = i;
              insideSingleLineComment = true;
              i++;
            }
            break;
        }
        break;

      case "*":
        if (nextChar === "/") {
          if (insideMultilineComment) {
            currentMultiline.stop = i + 2;
            comments.push(currentMultiline);
            currentMultiline = { start: -1, stop: -1 };
            insideMultilineComment = false;
            i++;
          }
        }
        break;

      case "\n":
      case "\r":
        if (insideSingleLineComment) {
          // console.log('STOP SINGLE LINE');
          currentSingleLine.stop = i;
          comments.push(currentSingleLine);
          currentSingleLine = { start: -1, stop: -1 };
          insideSingleLineComment = false;
        }
        break;
    }
  }

  // Our indices discovered are ascending in nature, so we must remove them
  // descending
  comments.reverse();

  comments.forEach(comment => {
    str = spliceStr(str, comment.start, comment.stop - comment.start);
  });

  return str;
}
