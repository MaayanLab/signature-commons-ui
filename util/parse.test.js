import assert from 'assert'
import { count_first_na, dictzip, parse, parse_csv } from './parse'

describe('util.parse', () => {
  it('count_first_na', () => {
    assert.equal(
      count_first_na([null, null, 1]),
      2
    )
  })

  it('dictzip', () => {
    assert.deepEqual(
      dictzip(['a', 'b', 'c'], [1, 2, 3]),
      {
        'a': 1,
        'b': 2,
        'c': 3,
      }
    )
  })

  it('parse csv', () => {
    assert.deepEqual(
      parse_csv(',Cell Type,MCF10\n,Drug,mydrug\nGene,Cell Line,\nSTAT3,mycellline,0.4'),
      [
        [ null, "Cell Type", "MCF10" ],
        [ null, "Drug", "mydrug" ],
        [ "Gene", "Cell Line", null ],
        [ "STAT3", "mycellline", 0.4 ],
      ]
    )
  })

  it('parse', () => {
    assert.deepEqual(
      [...parse([
        [         null,  'Cell Type',      'MCF10', 'mycelltype',],
        [         null,       'Drug',     'mydrug','myotherdrug',],
        [      'Gene',  'Cell Line',          null,          null,],
        [     'STAT3',       'Blah',          0.1,          0.2,],
      ])],
      [
        {
          'data': 0.1,
          'meta': {
            'Cell Line': 'Blah',
            'Cell Type': 'MCF10',
            'Drug': 'mydrug',
            'Gene': 'STAT3'
          }
        },
        {
          'data': 0.2,
          'meta': {
            'Cell Line': 'Blah',
            'Cell Type': 'mycelltype',
            'Drug': 'myotherdrug',
            'Gene': 'STAT3'
          }
        }
      ]
    )
  })
})