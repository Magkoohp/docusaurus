/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {jest} from '@jest/globals';
import path from 'path';
import shell from 'shelljs';
import {getFileLastUpdate} from '@docusaurus/utils';

describe('getFileLastUpdate', () => {
  const existingFilePath = path.join(
    __dirname,
    '__fixtures__/simple-site/docs/hello.md',
  );
  it('existing test file in repository with Git timestamp', async () => {
    const lastUpdateData = await getFileLastUpdate(existingFilePath);
    expect(lastUpdateData).not.toBeNull();

    const {author, timestamp} = lastUpdateData!;
    expect(author).not.toBeNull();
    expect(typeof author).toBe('string');

    expect(timestamp).not.toBeNull();
    expect(typeof timestamp).toBe('number');
  });

  it('existing test file with spaces in path', async () => {
    const filePathWithSpace = path.join(
      __dirname,
      '__fixtures__/simple-site/docs/doc with space.md',
    );
    const lastUpdateData = await getFileLastUpdate(filePathWithSpace);
    expect(lastUpdateData).not.toBeNull();

    const {author, timestamp} = lastUpdateData!;
    expect(author).not.toBeNull();
    expect(typeof author).toBe('string');

    expect(timestamp).not.toBeNull();
    expect(typeof timestamp).toBe('number');
  });

  it('non-existing file', async () => {
    const consoleMock = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const nonExistingFileName = '.nonExisting';
    const nonExistingFilePath = path.join(
      __dirname,
      '__fixtures__',
      nonExistingFileName,
    );
    await expect(getFileLastUpdate(nonExistingFilePath)).rejects.toThrow(
      /An error occurred when trying to get the last update date/,
    );
    expect(consoleMock).toHaveBeenCalledTimes(0);
    consoleMock.mockRestore();
  });

  it('git does not exist', async () => {
    const mock = jest.spyOn(shell, 'which').mockImplementationOnce(() => null);
    const consoleMock = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const lastUpdateData = await getFileLastUpdate(existingFilePath);
    expect(lastUpdateData).toBeNull();
    expect(consoleMock).toHaveBeenLastCalledWith(
      expect.stringMatching(
        /.*\[WARNING\].* Sorry, the docs plugin last update options require Git\..*/,
      ),
    );

    consoleMock.mockRestore();
    mock.mockRestore();
  });
});
