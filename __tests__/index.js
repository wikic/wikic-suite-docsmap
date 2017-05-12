/* eslint-env jest, node */

const typeMap = any => any;
const docsMapSuite = require('..');

const docsMap = docsMapSuite({
  docsMap: {
    enable: true,
  },
});

const { afterRead, beforeBuildDocs, afterBuildDocs } = docsMap;
const fse = {
  writeJSON: jest.fn(() => Promise.resolve()),
};

describe('docsMap', () => {
  describe('afterRead', () => {
    it('returns original context and do nothing with wikic if IS_DOC is falsy', () => {
      const wikic = { typeMap };
      const origin = {};
      expect(afterRead.call(wikic, origin)).toBe(origin);
      expect(afterRead(origin)).toEqual({});
      expect(wikic).toEqual({ typeMap });
    });

    it('do nothing with wikic if page.hide', () => {
      const wikic = { typeMap };
      const origin = {
        IS_DOC: true,
        page: {
          hide: true,
          title: 'title1',
          address: '/2.html',
          types: ['a', 'b', 'd'],
        },
      };
      expect(afterRead.call(wikic, origin)).toBe(origin);
      expect(wikic).toEqual({ typeMap });
    });

    it('throws if page not found', () => {
      const wikic = { typeMap };
      expect(() => {
        afterRead.call(wikic, {
          IS_DOC: true,
        });
      }).toThrow();
    });

    it('works properly', () => {
      const wikic = { typeMap };
      afterRead.call(wikic, {
        page: {
          title: 'title1',
          address: '/2.html',
          types: ['a', 'b', 'd'],
        },
        IS_DOC: true,
      });
      expect(docsMap.flatInfos).toEqual([
        {
          title: 'title1',
          address: '/2.html',
          types: ['a', 'b', 'd'],
        },
      ]);
    });
  });

  test('beforeBuildDocs', () => {
    beforeBuildDocs();
    expect(docsMap.flatInfos).toBeFalsy();
  });

  describe('afterBuildDocs', () => {
    it('works', async () => {
      const wikic = {
        fse,
        publicPath: '/c/a',
        config: {
          docsMap: {
            output: 'la.json',
          },
        },
      };
      fse.writeJSON.mockClear();
      docsMap.flatInfos = 'something';
      await afterBuildDocs.call(wikic);
      expect(wikic.fse.writeJSON.mock.calls[0][0]).toBe('/c/a/la.json');
      expect(wikic.fse.writeJSON.mock.calls[0][1]).toBe('something');
    });

    it('use docs.json default', async () => {
      const wikic = {
        fse,
        publicPath: '/c/a',
        config: {},
      };
      docsMap.flatInfos = 'something';

      fse.writeJSON.mockClear();
      await afterBuildDocs.call(wikic);
      expect(fse.writeJSON.mock.calls[0][0]).toBe('/c/a/docs.json');
      expect(fse.writeJSON.mock.calls[0][1]).toBe('something');

      fse.writeJSON.mockClear();
      wikic.config.docsMap = {};
      await afterBuildDocs.call(wikic);
      expect(fse.writeJSON.mock.calls[0][0]).toBe('/c/a/docs.json');
    });

    it('returns directly if flatInfo is falsy', async () => {
      fse.writeJSON.mockClear();
      const wikic = {
        publicPath: '/c/a',
        config: {
          docsMap: {
            output: 'la.json',
          },
        },
      };
      docsMap.flatInfos = null;
      await afterBuildDocs.call(wikic);
      expect(fse.writeJSON).not.toHaveBeenCalled();
    });
  });
});