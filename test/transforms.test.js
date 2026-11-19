const test = require('node:test');
const assert = require('node:assert/strict');
const t = require('../src/transforms');

test('casing keeps accented letters instead of splitting on them', () => {
  assert.equal(t.toSnake('açãoDoUsuário'), 'ação_do_usuário');
  assert.equal(t.toCamel('ação do usuário'), 'açãoDoUsuário');
  assert.equal(t.toPascal('coração-valente'), 'CoraçãoValente');
  assert.equal(t.toConstant('über uns'), 'ÜBER_UNS');
});

test('casing treats any non-alphanumeric run as a separator', () => {
  for (const input of ['hello_world', 'hello-world', 'hello world', 'helloWorld']) {
    assert.equal(t.toKebab(input), 'hello-world');
  }
  assert.equal(t.toDot('User Profile'), 'user.profile');
  assert.equal(t.toTitle('user_profile'), 'User Profile');
});

test('sorting variants', () => {
  assert.equal(t.sortLines('b\na\nc'), 'a\nb\nc');
  assert.equal(t.sortLinesDescending('b\na\nc'), 'c\nb\na');
  assert.equal(t.sortLinesNatural('file10\nfile2'), 'file2\nfile10');
  assert.equal(t.sortLinesInsensitive('b\nA\nc'), 'A\nb\nc');
});

test('line utilities handle CRLF, duplicates and order', () => {
  assert.equal(t.uniqueLines('a\r\nb\r\na'), 'a\nb');
  assert.equal(t.reverseLines('1\n2\n3'), '3\n2\n1');
});

test('shuffle keeps every line exactly once', () => {
  const out = t.shuffleLines('a\nb\nc\nd', () => 0.3).split('\n').sort();
  assert.deepEqual(out, ['a', 'b', 'c', 'd']);
});
