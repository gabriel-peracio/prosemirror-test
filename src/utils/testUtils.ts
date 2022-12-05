import { act } from "@testing-library/react";

/**
 * This function is a wrapper around the act function from react-testing-library, used to prevent dispatches to
 * prosemirror from causing a warning about updating state during render.
 * @param sleepMs Number of ms to sleep (usually 0)
 * @example
 * ```typescript
 *  userEvent.keyboard("abc");
 *  await actSleep(0);
 * ```
 */
export const actSleep = (sleepMs: number) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, sleepMs));
  });
