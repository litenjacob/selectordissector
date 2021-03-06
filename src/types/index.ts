export * from './querytoken';
export * from './velement';

export type Path = number[];
export type Collection = Path[];

import {QueryToken} from './querytoken';

export type Selector = QueryToken[];

export enum FormulaType {
  exact = '5',
  negAndOffset = '-n+2',
  multAndPosOffset = '3n+2',
  multAndNegOffset = '3n-2',
  mult = '3n',
  even = 'even',
  odd = 'odd',
  unknown = 'unknown'
}

export type FormulaClassification = [FormulaType] | [FormulaType, number] | [FormulaType, number, number];
