import * as test from 'tape';

import {VirtualElement, PseudoToken} from '../../types';
import {div,span, getDescendantPaths} from '../../helpers';
import {testElement, testCollection} from '../../matcher';
import parser from '../../parser';

test('Element tester returns correct result for first-of-type comparison', t => {
  type TestCase = [VirtualElement, number[], boolean, string];
  const firstOfTypeComparisons: TestCase[] = [
    [div(), [], true, 'top of pyramid is always first-of-type'],
    [div([div(),div()]), [1], false, 'first-of-type is false if earlier sibling has same type'],
    [div([span(),div()]), [1], true, 'first-of-type is true if no earlier sibling has same type']
  ];
  const firstOfType: PseudoToken = {type:'pseudo', name:'first-of-type'};  
  firstOfTypeComparisons.forEach(([tree, path, result, description]) => t.deepEqual(
    testElement(tree, path, firstOfType),
    result,
    description
  ));
  t.end();
});

test('Element tester returns correct result for last-of-type comparison', t => {
  type TestCase = [VirtualElement, number[], boolean, string];
  const lastOfTypeComparisons: TestCase[] = [
    [div(), [], true, 'top of pyramid is always last-of-type'],
    [div([div(),div()]), [0], false, 'last-of-type is false if later sibling has same type'],
    [div([div(),span()]), [0], true, 'last-of-type is true if no later sibling has same type'],
    [div([div(),div(),span()]), [1], true, 'last-of-type is true if no later sibling has same type, even if earlier is same']
  ];
  const lastOfType: PseudoToken = {type:'pseudo', name:'last-of-type'};  
  lastOfTypeComparisons.forEach(([tree, path, result, description]) => t.deepEqual(
    testElement(tree, path, lastOfType),
    result,
    description
  ));
  t.end();
});

test('Element tester returns correct result for only-of-type comparison', t => {
  type TestCase = [VirtualElement, number[], boolean, string];
  const lastOfTypeComparisons: TestCase[] = [
    [div(), [], true, 'top of pyramid is always only-of-type'],
    [div([div(),span(),div()]), [0], false, 'only-of-type is false if a sibling has same type'],
    [div([div(),span(),div()]), [1], true, 'only-of-type is true if no sibling has same type'],
    [div([div()]), [0], true, 'only-of-type is true when we have no siblings']
  ];
  const lastOfType: PseudoToken = {type:'pseudo', name:'only-of-type'};  
  lastOfTypeComparisons.forEach(([tree, path, result, description]) => t.deepEqual(
    testElement(tree, path, lastOfType),
    result,
    description
  ));
  t.end();
});


test('Element tester returns correct result for :empty pseudo selector', t => {
  type TestCase = [VirtualElement, number[], boolean, string];
  const tree = div([span()]);
  const emptyComparisons: TestCase[] = [
    [tree, [], false, ':empty returns false if we have children'],
    [tree, [0], true, ':empty returns true if we dont have children'],
  ];
  const empty: PseudoToken = {type:'pseudo', name:'empty'};  
  emptyComparisons.forEach(([tree, path, result, description]) => t.deepEqual(
    testElement(tree, path, empty),
    result,
    description
  ));
  t.end();
});

test('Element tester returns correct result for first-child comparison', t => {
  type TestCase = [VirtualElement, number[], boolean, string];
  const tree = div([span(),span(),span()]);
  const firstChildComparisons: TestCase[] = [
    [tree, [], true, 'top of pyramid is always first-child'],
    [tree, [0], true, 'oldest sibling is first-child'],
    [tree, [1], false, 'middle sibling isnt first-child'],
    [tree, [2], false, 'youngest sibling isnt first-child']
  ];
  const firstChild: PseudoToken = {type:'pseudo', name:'first-child'};
  firstChildComparisons.forEach(([tree, path, result, description]) => t.deepEqual(
    testElement(tree, path, firstChild),
    result,
    description
  ));
  t.end();
});

test('Element tester returns correct result for last-child comparison', t => {
  type TestCase = [VirtualElement, number[], boolean, string];
  const tree = div([span(),span(),span()]);
  const lastChildComparisons: TestCase[] = [
    [tree, [], true, 'top of pyramid is always last-child'],
    [tree, [0], false, 'oldest sibling isnt last-child'],
    [tree, [1], false, 'middle sibling isnt last-child'],
    [tree, [2], true, 'youngest sibling is last-child']
  ];
  const lastChild: PseudoToken = {type:'pseudo', name:'last-child'};
  lastChildComparisons.forEach(([tree, path, result, description]) => t.deepEqual(
    testElement(tree, path, lastChild),
    result,
    description
  ));
  t.end();
});

const tree = (
  div([
    div([
      div(),
      div(),
      div([
        div()
      ])
    ]),
    div([
      div([
        div()
      ])
    ])
  ])
)

const allInTree = getDescendantPaths(tree, []);

test('Collection tester returns correct result for nth-child comparison', t => {
  type TestCase = [string, number[][], string];
  const nthCases: TestCase[] = [
    [':nth-child(2)', [ [0,1], [1] ], ':nth-child(2) gives correct result'],
    [':nth-child(1)', [ [], [0], [0,0], [0,2,0], [1,0], [1,0,0] ], ':nth-child(1) includes all oldest sibling, including pyramid top'],
    [':nth-child(-n+2)', [ [], [0], [0,0], [0,1], [0,2,0], [1], [1,0], [1,0,0] ], ':nth-child(-n+2) includes two oldest siblings'],
    [':nth-child(2n-1)', [ [], [0], [0,0], [0,2], [0,2,0], [1,0], [1,0,0] ], ':nth-child(2n-1) includes every odd sibling'],
    [':nth-child(2n+1)', [ [], [0], [0,0], [0,2], [0,2,0], [1,0], [1,0,0] ], ':nth-child(2n+1) includes every odd sibling'],
    [':nth-child(odd)', [ [], [0], [0,0], [0,2], [0,2,0], [1,0], [1,0,0] ], ':nth-child(odd) includes every odd sibling'],
    [':nth-child(2n)', [ [0,1], [1] ], ':nth-child(2n) includes every even sibling'],
    [':nth-child(2n+2)', [ [0,1], [1] ], ':nth-child(2n+2) includes every even sibling'],
    [':nth-child(2n-6)', [ [0,1], [1] ], ':nth-child(n2-6) includes every even sibling'],
    [':nth-child(even)', [ [0,1], [1] ], ':nth-child(even) includes every even sibling'],
  ];
  nthCases.forEach(([query, collection, description]) => t.deepEqual(
    testCollection(tree, allInTree, parser(query)[0][0]),
    collection,
    description
  ));
  t.end();
});