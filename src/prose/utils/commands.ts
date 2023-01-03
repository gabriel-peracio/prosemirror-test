import { Command } from "prosemirror-state";

/**
 * Given a name and a command function, log the command name as well as the execution result to the console.
 * This is useful for quickly determining which command actually runs in a chainCommands sequence.
 * @param commandName Name that will appear in the console when the command is executed
 * @param commandFn The actual command to execute
 * @returns the result of running the command (true/false)
 * @example
 * ```typescript
 *   ArrowLeft: chainCommands(
 *     debugCommand('breakOutOfInlineCode',breakOutOfInlineCode('left')),
 *     debugCommand('deleteZeroWidthSpaceWithoutInlineCode',deleteZeroWidthSpaceWithoutInlineCode('left')),
 *     debugCommand('moveLeftIntoTable',moveLeftIntoTable),
 *     debugCommand('moveLeftInTable',moveLeftInTable),
 *   ),
 * // will log the following to the console:
 * // breakOutOfInlineCode: false
 * // deleteZeroWidthSpaceWithoutInlineCode: false
 * // moveLeftIntoTable: true
 * // notice that `moveLeftInTable` is never logged because it was never executed
 * ```
 */
export const debugCommand: (
  commandName: string,
  commandFn: Command
) => (...attrs: Parameters<Command>) => boolean =
  (commandName, commandFn) =>
  (...attrs) => {
    const commandResult = commandFn(...attrs);
    // eslint-disable-next-line no-console
    console.log(commandName, commandResult);
    return commandResult;
  };
