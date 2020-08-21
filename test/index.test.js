const goarGulpNpm = require('..')

// TODO: Implement module test
test('goar-gulp-npm', () => {
  expect(goarGulpNpm('w')).toBe('w@zce.me')
  expect(goarGulpNpm('w', { host: 'wedn.net' })).toBe('w@wedn.net')
  expect(() => goarGulpNpm(100)).toThrow('Expected a string, got number')
})
