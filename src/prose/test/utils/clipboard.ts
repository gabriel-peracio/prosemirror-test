type clipboardData =
  | {
      "text/html": string;
    }
  | {
      "text/plain": string;
    }
  | {
      "text/html": string;
      "text/plain": string;
    };
/**
 * Creates a ClipboardData object out of a record in the shape `{[mime]: string}` that can be passed to `fireEvent.paste` from `@testing-library/react`
 * @param data a record in the shape `{[mime]: string}` where mime is either `text/plain` or `text/html` or both. At least one of the two must be present.
 * @returns A ClipboardData object that can be passed to `fireEvent.paste` from `@testing-library/react`
 * @example
 * ```typescript
 * fireEvent.paste(view.dom,
 *   makeClipboardData({ "text/html": "<h1>Heading</h1>" })
 * );
 * ```
 */
export function makeClipboardData(data: clipboardData) {
  return {
    clipboardData: {
      getData: (mime: "text/plain" | "text/html") => {
        switch (mime) {
          case "text/plain":
            if ("text/plain" in data) return data["text/plain"];
            return undefined;
          case "text/html":
            if ("text/html" in data) return data["text/html"];
            return undefined;
        }
      },
    },
  };
}
