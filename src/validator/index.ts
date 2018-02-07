import parser from '../parser';
import {QueryToken, TokenType, PseudoName, Path} from '../types';
import {isCombinator, matchPosition} from '../helpers';

export enum QueryError {
  parseError = 'parseError',
  parentCombinator = 'parentCombinator',
  adjacentCombinators = 'adjacentCombinators',
  endingCombinator = 'endingCombinator',
  leadingCombinator = 'leadingCombinator',
  isPseudoSelector = 'isPseudoSelector',
  hasPseudoSelector = 'hasPseudoSelector',
  unknownPseudoSelector = 'unknownPseudoSelector',
  nthOfTypeDataError = 'nthOfTypeDataError',
  unImplemented = 'unImplemented',
  faultyFormula = 'faultyFormula'
}

const usesFormula = [PseudoName.nthChild, PseudoName.nthOfType];

const unImplementedPseudos = [PseudoName.not];

type Context = {
  path: number[],
  pos: number,
  previous: QueryToken | null,
  remaining: QueryToken[]
}

function fail(error: QueryError, context: Context){
  return [error, context.path.concat(context.pos)];
}

function val(context: Context){
  if (context.remaining.length === 0) {
    return null;
  }
  const token = context.remaining[0];

  if (token.type === TokenType.pseudo && Object.keys(PseudoName).map(k => PseudoName[k]).indexOf(token.name) === -1){
    return fail(QueryError.unknownPseudoSelector, context);
  }

  if (token.type === TokenType.pseudo && unImplementedPseudos.indexOf(token.name) !== -1){
    return fail(QueryError.unImplemented, context);
  }

  if (token.type === TokenType.parent){
    return fail(QueryError.parentCombinator, context);
  }

  if (token.type === TokenType.pseudo && token.name === 'is'){
    return fail(QueryError.isPseudoSelector, context);
  }

  if (token.type === TokenType.pseudo && token.name === 'has'){
    return fail(QueryError.hasPseudoSelector, context);
  }

  if (context.remaining.length === 1 && isCombinator(token)){
    return fail(QueryError.endingCombinator, context);
  }

  if (context.pos === 0 && isCombinator(token)){
    return fail(QueryError.leadingCombinator, context);
  }

  if (isCombinator(token) && isCombinator(context.previous)){
    return fail(QueryError.adjacentCombinators, context);
  }

  if (token.type === TokenType.pseudo && usesFormula.indexOf(token.name) > -1){
    try {
      matchPosition(0, token.data);
    } catch(e) {
      return fail(QueryError.faultyFormula, context);
    }
    if (token.data === '0'){
      return fail(QueryError.faultyFormula, context);
    }
  }

  return val({
    path: context.path,
    pos: context.pos + 1,
    previous: token,
    remaining: context.remaining.slice(1)
  });
}

export default function validate(query: string) : [QueryError] | [QueryError, Path] | null {
  try {
    const q = parser(query)[0]; // TODO - handle multiple!
    return val({
      path: [],
      pos: 0,
      previous: null,
      remaining: q
    });
  } catch(e) {
    return [QueryError.parseError];
  }
}
