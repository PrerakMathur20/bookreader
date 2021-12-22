import { UrlPlugin } from '@/src/plugins/url/UrlPlugin';

afterEach(() => {
  jest.clearAllMocks();
});

describe('UrlPlugin tests', () => {
  const urlPlugin = new UrlPlugin();

  describe('urlStateToUrlString tests', () => {
    test('urlStateToUrlString with known states in schema', () => {
      const urlState = { page: 'n7', mode: '1up', search: 'foo' };
      const urlStateWithQueries = { page: 'n7', mode: '1up', q: 'hello', view: 'theater', sort: 'title_asc' };

      const expectedUrlFromState = 'page/n7/mode/1up?q=foo';
      const expectedUrlFromStateWithQueries = 'page/n7/mode/1up?q=hello&view=theater&sort=title_asc';

      expect(urlPlugin.urlStateToUrlString(urlState)).toBe(expectedUrlFromState);
      expect(urlPlugin.urlStateToUrlString(urlStateWithQueries)).toBe(expectedUrlFromStateWithQueries);
    });

    test('urlStateToUrlString with unknown states in schema', () => {
      const urlState = { page: 'n7', mode: '1up' };
      const urlStateWithQueries = { page: 'n7', mode: '1up', q: 'hello', viewer: 'theater', sortBy: 'title_asc' };

      const expectedUrlFromState = 'page/n7/mode/1up';
      const expectedUrlFromStateWithQueries = 'page/n7/mode/1up?q=hello&viewer=theater&sortBy=title_asc';

      expect(urlPlugin.urlStateToUrlString(urlState)).toBe(expectedUrlFromState);
      expect(urlPlugin.urlStateToUrlString(urlStateWithQueries)).toBe(expectedUrlFromStateWithQueries);
    });

    test('urlStateToUrlString with boolean value', () => {
      const urlState = { page: 'n7', mode: '1up', search: 'foo', view: 'theater', wrapper: 'false' };
      const expectedUrlFromState = 'page/n7/mode/1up?q=foo&view=theater&wrapper=false';

      expect(urlPlugin.urlStateToUrlString(urlState)).toBe(expectedUrlFromState);
    });
  });

  describe('urlStringToUrlState tests', () => {
    test('urlStringToUrlState without query string', () => {
      const url = '/page/n7/mode/2up';
      const url1 = '/page/n7/mode/1up';

      expect(urlPlugin.urlStringToUrlState(url)).toEqual({page: 'n7', mode: '2up'});
      expect(urlPlugin.urlStringToUrlState(url1)).toEqual({page: 'n7', mode: '1up'});
    });

    test('urlStringToUrlState with deprecated_for', () => {
      const url = '/page/n7/mode/2up/search/hello';

      expect(urlPlugin.urlStringToUrlState(url)).toEqual({page: 'n7', mode: '2up', q: 'hello'});
    });

    test('urlStringToUrlState with query string', () => {
      const url = '/page/n7/mode/2up/search/hello?view=theather&foo=bar&sort=title_asc';
      const url1 = '/mode/2up?ref=ol&ui=embed&wrapper=false&view=theater';

      expect(urlPlugin.urlStringToUrlState(url)).toEqual(
        {page: 'n7', mode: '2up', q: 'hello', view: 'theather', foo: 'bar', sort: 'title_asc'}
      );
      expect(urlPlugin.urlStringToUrlState(url1)).toEqual(
        {page: 'n0', mode: '2up', ref: 'ol', ui: 'embed', wrapper: 'false', view: 'theater'}
      );
    });

    test('urlStringToUrlState compare search and ?q', () => {
      const url = '/page/n7/mode/2up/search/hello';
      urlPlugin.urlState = { q: 'hello' };

      expect(urlPlugin.urlStringToUrlState(url)).toEqual({page: 'n7', mode: '2up', q: 'hello'});
    });
  });

  describe('url plugin helper functions', () => {
    test('setUrlParam', () => {
      urlPlugin.urlState = {};
      urlPlugin.setUrlParam('page', '20');
      urlPlugin.setUrlParam('mode', '2up');

      expect(urlPlugin.urlState).toEqual({page: '20', mode: '2up'});
    });

    test('removeUrlParam', () => {
      urlPlugin.setUrlParam('page', '20');
      urlPlugin.setUrlParam('mode', '2up');
      urlPlugin.removeUrlParam('mode');

      expect(urlPlugin.urlState).toEqual({page: '20'});
    });

    test('getUrlParam', () => {
      urlPlugin.setUrlParam('page', '20');
      urlPlugin.setUrlParam('mode', '2up');
      expect(urlPlugin.getUrlParam('page')).toEqual('20');
      expect(urlPlugin.getUrlParam('mode')).toEqual('2up');
    });
  });

  describe('pullFromAddressBar and pushToAddressBar - hash mode', () => {
    test('url without mode state value - use default', () => {
      urlPlugin.urlState = {};
      urlPlugin.urlMode = 'hash';

      urlPlugin.pullFromAddressBar({ pathname: '', search: '', hash: '#page/12' });
      expect(urlPlugin.urlState).toEqual({page: '12', mode: '2up'});

      urlPlugin.pushToAddressBar();
      expect(window.location.hash).toEqual('#page/12/mode/2up');
    });

    test('url with query param', () => {
      urlPlugin.urlState = {};
      urlPlugin.urlMode = 'hash';

      urlPlugin.pullFromAddressBar({ pathname: '', search: '', hash: '#page/12?q=hello&view=theater' });
      expect(urlPlugin.urlState).toEqual({page: '12', mode: '2up', q: 'hello', view: 'theater'});

      urlPlugin.pushToAddressBar();
      expect(window.location.hash).toEqual('#page/12/mode/2up?q=hello&view=theater');
    });
  });

  describe('pullFromAddressBar and pushToAddressBar - history mode', () => {
    test('url without mode state value - use default', () => {
      urlPlugin.urlState = {};
      urlPlugin.urlHistoryBasePath = '/details/foo/';
      urlPlugin.urlMode = 'history';

      urlPlugin.pullFromAddressBar({ pathname: '/details/foo/page/12', search: '', hash: '' });
      expect(urlPlugin.urlState).toEqual({page: '12', mode: '2up'});

      urlPlugin.pushToAddressBar();
      expect(window.location.pathname).toEqual('/details/foo/page/12/mode/2up');
    });

    test('url with query param', () => {
      urlPlugin.urlState = {};
      urlPlugin.urlHistoryBasePath = '/details/foo/';
      urlPlugin.urlMode = 'history';

      urlPlugin.pullFromAddressBar({ pathname: '/details/foo/page/12', search: '?q=hello&view=theater', hash: '' });
      expect(urlPlugin.urlState).toEqual({page: '12', mode: '2up', q: 'hello', view: 'theater'});

      urlPlugin.pushToAddressBar();
      const locationUrl = `${window.location.pathname}${window.location.search}`;
      expect(locationUrl).toEqual('/details/foo/page/12/mode/2up?q=hello&view=theater');
    });
  });

});
