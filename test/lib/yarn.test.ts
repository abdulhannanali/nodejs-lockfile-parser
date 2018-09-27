import {buildDepTreeFromFiles} from '../../lib';
import getRuntimeVersion from '../../lib/get-node-runtime-version';
import * as fs from 'fs';
import * as _ from 'lodash';

if (getRuntimeVersion() < 6) {
  test('Parse yarn.lock', async (t) => {
    const expectedError = new Error();
    expectedError.name = 'UnsupportedRuntimeError';
    expectedError.message = 'Parsing `yarn.lock` is not supported on Node.js version less than 6. Please upgrade your Node.js environment or use `package-lock.json`';
    t.rejects(buildDepTreeFromFiles(
      `${__dirname}/fixtures/goof/`,
      'package.json',
      'yarn.lock',
    ), expectedError, 'Information about non-supported environment is shown');
  });
} else {
  const load = (filename) => JSON.parse(
    fs.readFileSync(`${__dirname}/fixtures/${filename}`, 'utf8'),
  );

  test('Parse yarn.lock', async (t) => {
    const expectedDepTree = load('goof/dep-tree-no-dev-deps-yarn.json');

    const depTree = await buildDepTreeFromFiles(
      `${__dirname}/fixtures/goof/`,
      'package.json',
      'yarn.lock',
    );

    t.deepEqual(depTree, expectedDepTree, 'Tree generated as expected');
  });

  test('Parse yarn.lock with cyclic deps', async (t) => {
    const depTree = await buildDepTreeFromFiles(
      `${__dirname}/fixtures/cyclic-dep-simple/`,
      'package.json',
      'yarn.lock',
    );
    t.strictEqual(depTree.dependencies.debug.dependencies.ms.dependencies.debug.cyclic, true, 'Cyclic dependency is found correctly');
  });

  test('Parse yarn.lock with dev deps only', async (t) => {
    const expectedDepTree = load('dev-deps-only/expected-tree.json');
    const depTree = await buildDepTreeFromFiles(
      `${__dirname}/fixtures/dev-deps-only/`,
      'package.json',
      'yarn.lock',
      true,
    );
    t.deepEqual(depTree, expectedDepTree, 'Tree is created with dev deps only');
  });

  test('Parse yarn.lock with empty devDependencies', async (t) => {
    const depTree = await buildDepTreeFromFiles(
      `${__dirname}/fixtures/empty-dev-deps/`,
      'package.json',
      'yarn.lock',
      true,
    );

    t.false(depTree.hasDevDependencies, 'Package doesn\'t have devDependencies');
    t.ok(depTree.dependencies['adm-zip'], 'Dependencies are reported correctly');
  });

  test('Parse yarn.lock with devDependencies', async (t) => {
    const expectedDepTree = load('goof/dep-tree-with-dev-deps-yarn.json');

    const depTree = await buildDepTreeFromFiles(
      `${__dirname}/fixtures/goof/`,
      'package.json',
      'yarn.lock',
      true,
    );

    t.deepEqual(depTree, expectedDepTree, 'Tree generated as expected');
  });

  test('Parse yarn.lock with missing dependency', async (t) => {
      t.rejects(buildDepTreeFromFiles(
        `${__dirname}/fixtures/goof/`,
        'package.json',
        'yarn_missing_dep.lock',
      ), null, 'Error is thrown');
  });

  test('Parse yarn.lock with repeated dependency', async (t) => {
    const expectedDepTree = load('package-repeated-in-manifest/expected-tree.json');

    const depTree = await buildDepTreeFromFiles(
      `${__dirname}/fixtures/package-repeated-in-manifest/`,
      'package.json',
      'yarn.lock',
      false,
    );

    t.deepEqual(depTree, expectedDepTree, 'Tree generated as expected');
  });

  test('Parse yarn.lock with missing package name', async (t) => {
    const depTree = await buildDepTreeFromFiles(
      `${__dirname}/fixtures/missing-name/`,
      'package.json',
      'yarn.lock',
      true,
    );

    t.false(_.isEmpty(depTree.dependencies));
    t.equals(depTree.name, undefined);
  });

  test('Parse yarn.lock with empty dependencies and includeDev = false', async (t) => {
    const expectedDepTree = load('missing-deps/expected-tree.json');
    const depTree = await buildDepTreeFromFiles(
      `${__dirname}/fixtures/missing-deps/`,
      'package.json',
      'yarn.lock',
      false,
    );
    t.deepEqual(depTree, expectedDepTree, 'Tree is created with empty deps');
  });

  test('Parse yarn.lock with empty dependencies and includeDev = true', async (t) => {
    const expectedDepTree = load('missing-deps/expected-tree.json');
    const depTree = await buildDepTreeFromFiles(
      `${__dirname}/fixtures/missing-deps/`,
      'package.json',
      'yarn.lock',
      true,
    );
    t.deepEqual(depTree, expectedDepTree, 'Tree is created with empty deps');
  });

  test('Parse invalid yarn.lock', async (t) => {
    t.rejects(buildDepTreeFromFiles(
        `${__dirname}/fixtures/invalid-files/`,
        'package.json',
        'yarn.lock',
      ), new Error('yarn.lock parsing failed with an error'), 'Expected error is thrown');
  });
}