// From https://github.com/chakra-ui/chakra-ui/blob/5e1ea4a4c4108c08fc327480c7f73102ea4f568b/packages/components/media-query/src/media-query.utils.ts
// It is not exported by chakra-ui.
export function getClosestValue<T>(
  values: Record<string, T>,
  breakpoint: string,
  breakpoints: string[]
): T | undefined;
export function getClosestValue<T>(
  values: Record<string, T>,
  breakpoint: string,
  breakpoints: string[],
  defaultValue: T
): T;
export function getClosestValue<T>(
  values: Record<string, T>,
  breakpoint: string,
  breakpoints: string[],
  defaultValue?: T
) {
  let index = Object.keys(values).indexOf(breakpoint);

  if (index !== -1) {
    return values[breakpoint];
  }

  let stopIndex = breakpoints.indexOf(breakpoint);

  while (stopIndex >= 0) {
    const key = breakpoints[stopIndex];

    if (values[key]) {
      index = stopIndex;
      break;
    }
    stopIndex -= 1;
  }

  if (index !== -1) {
    const key = breakpoints[index];
    return values[key];
  }

  return defaultValue;
}
