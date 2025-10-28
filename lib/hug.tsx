import React from 'react';
import {
  HTMLChakraProps,
  RecipeDefinition,
  chakra,
  useBreakpointValue,
  useChakraContext,
  useToken
} from '@chakra-ui/react';

import { getClosestValue } from './utils';

// 🤗 Human Universal Gridder
//
// Grid:
//   start    1    2    3    4    5    6    7    8    9   10   11   12     end
// |      |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|      |
// |      |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|      |
// |      |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|      |
// |      |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|      |
// |      |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|  |*|      |
//
// The start and end take up 1 fraction and its size is fluid, depending on
// window size.
// Each column takes up a 12th of the max content width (defined in the theme).
// Grid gaps are marked with an asterisk.
// Each instance of Human Universal Gridder, nested inside another Human
// Universal Gridder must define its grid for the different media queries,
// through a grid prop.
// If the grid for a given media query is not defined the previous one will be
// used (<media query>Up pattern).
// The value for each media query breakpoint is an array with a start and an end
// column. It works much like the `grid-column` property of css.
//    <Hug>
//      <Hug
//        hugGrid={{
//          base: ['full-start', 'full-end'],
//          md: ['content-2', 'content-4'],
//          lg: ['content-2', 'content-5'],
//        }}
//      >
//        Subgrid 1
//      </Hug>
//      <Hug
//        hugGrid={{
//          base: ['full-start', 'full-end'],
//          // md is not defined, so base will be used until lg.
//          lg: ['content-6', 'full-end'],
//        }}
//      >
//        Subgrid 2
//      </Hug>
//    </Hug>
//
// The Human Universal Gridder will define a grid whose line names are always
// the same regardless of how many nested grids there are. Therefore an element
// placed on `content-5` will be aligned with the top most `content-5`.

// Line names to be used on the grid.
// In a css grid, the lines are named, not the columns.
// full-start
// content-start
// content-1 does not exist as it is named content-start
// content-2 to content-12
// content-end
// full-end

export interface HugProps extends HTMLChakraProps<'div'> {
  hugGrid?: Record<string, string[]>;
  ref?: React.Ref<HTMLDivElement>;
}

export function Hug(props: HugProps) {
  const { hugGrid, ref, ...rest } = props;

  const sys = useChakraContext();
  const recipe = sys.getRecipe('hug') as RecipeDefinition;

  const max =
    recipe.base?.maxW || recipe.base?.maxWidth || props.maxW || props.maxWidth;

  if (!max) {
    throw new Error(
      '🤗 Human Universal Gridder: No maxWidth defined in hug recipe or Hug props'
    );
  }

  const [layoutMax] = useToken('sizes', [max as string]);

  const breakpoints = Array.from(sys.breakpoints.keys() || []);
  // Using one single useBreakpoint and then getClosesValue because of a bug in
  // Chakra UI. https://github.com/chakra-ui/chakra-ui/issues/7609#issuecomment-1826371496
  const currentMdq = useBreakpointValue(breakpoints);

  if (!currentMdq) {
    throw new Error("🤗 Human Universal Gridder: Can't get current breakpoint");
  }

  const gaps = recipe.base?.gap || recipe.base?.gapX || props.gap || props.gapX;

  if (typeof gaps !== 'object' || Array.isArray(gaps)) {
    throw new Error(
      '🤗 Human Universal Gridder: Gap must be defined as an object with responsive values'
    );
  }

  const gapToken: string | undefined = getClosestValue(
    gaps as Record<string, string>,
    currentMdq,
    breakpoints
  );
  if (!gapToken) {
    throw new Error("🤗 Human Universal Gridder: Can't get current gap token");
  }
  const [gridGap] = useToken('sizes', [gapToken]);

  const columns = recipe.base?.columns || props.columns;
  if (typeof columns !== 'object' || Array.isArray(columns)) {
    throw new Error(
      '🤗 Human Universal Gridder: Columns must be defined as an object with responsive values'
    );
  }

  const columnCount: number | undefined = getClosestValue(
    columns as Record<string, number>,
    currentMdq,
    breakpoints
  );
  if (!columnCount) {
    throw new Error(
      "🤗 Human Universal Gridder: Can't get current number of columns"
    );
  }

  const gridProps = useHugGrid({
    userGrid: hugGrid,
    columnCount,
    layoutMax,
    gridGap,
    currentMdq,
    breakpoints
  });

  return (
    <chakra.div
      ref={ref}
      {...rest}
      display='grid'
      gap={gridGap}
      {...gridProps}
    />
  );
}

interface HugGridHookProps {
  userGrid?: Record<string, string[]>;
  columnCount: number;
  layoutMax: string;
  gridGap: string;
  currentMdq: string;
  breakpoints: string[];
}

function useHugGrid({
  userGrid,
  columnCount,
  layoutMax,
  gridGap,
  currentMdq,
  breakpoints
}: HugGridHookProps) {
  // Discard the base padding to ensure that gridded folds have the same size as
  // the constrainers.
  const layoutMaxNoPadding = `calc(${layoutMax} - ${gridGap})`;
  // Calculate how much of the content block (with is the layoutMaxNoPadding)
  // each column takes up.
  const fullColumn = `calc(${layoutMaxNoPadding} / ${columnCount})`;
  // To get the usable size of each column we need to account for the gap.
  const contentColWidth = `calc(${fullColumn} - ${gridGap})`;

  // Create the columns as:
  // [content-<num>] minmax(0, <size>)
  // Content columns start at index 2.
  const contentColumns = Array(columnCount - 1)
    .fill(0)
    .map((_, i) => ({
      name: `content-${i + 2}`,
      value: `[content-${i + 2}] minmax(0, ${contentColWidth})`
    }));

  // Create an array with all the columns definitions. It will be used to
  // filter out the ones that are not needed when taking the user's grid
  // definition into account.
  const gridTemplateForMdq = [
    { name: 'full-start', value: `[full-start] minmax(0, 1fr)` },
    {
      name: 'content-start',
      value: `[content-start] minmax(0, ${contentColWidth})`
    },
    ...contentColumns,
    { name: 'content-end', value: `[content-end] minmax(0, 1fr)` },
    { name: 'full-end', value: '[full-end]' }
  ];

  let gridTemplateColumns = gridTemplateForMdq;
  let gridColumn;

  // Check whether the user has defined a grid for the current media query.
  // If not, use the previous one instead of a subgrid.
  if (userGrid) {
    const defaultSubGrid = ['full-start', 'full-end'];
    const [start, end] = getClosestValue(
      userGrid,
      currentMdq,
      breakpoints,
      defaultSubGrid
    );

    gridColumn = `${start} / ${end}`;

    const startIdx = gridTemplateForMdq.findIndex((col) => col.name === start);
    const endIdx = gridTemplateForMdq.findIndex((col) => col.name === end);

    if (startIdx === -1 || endIdx === -1) {
      const line = startIdx === -1 ? start : end;
      throw new Error(`🤗 Human Universal Gridder

The grid line \`${line}\` does not exist in the ${currentMdq} media query which has ${columnCount} columns.
Grid lines for ${currentMdq}: ${gridTemplateForMdq
        .map((c) => c.name)
        .join(' | ')}`);
    }

    const lastColumn = gridTemplateForMdq[endIdx];
    gridTemplateColumns = [
      ...gridTemplateForMdq.slice(startIdx, endIdx),
      // Add the name of the last column without a size so we can use it for
      // naming purposes.
      { name: lastColumn.name, value: `[${lastColumn.name}]` }
    ];
  }

  return {
    gridTemplateColumns: gridTemplateColumns.map((col) => col.value).join('\n'),
    gridColumn
  };
}
