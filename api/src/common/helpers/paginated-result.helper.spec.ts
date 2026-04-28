import { paginatedResult } from './paginated-result.helper'

describe('paginatedResult', () => {
  it('computes totalPages from total and limit', () => {
    const r = paginatedResult(['a', 'b'], 25, 2, 10)
    expect(r.data).toEqual(['a', 'b'])
    expect(r.meta).toEqual({
      total: 25,
      page: 2,
      limit: 10,
      totalPages: 3,
    })
  })

  it('returns zero totalPages when total is zero', () => {
    const r = paginatedResult([], 0, 1, 20)
    expect(r.meta.totalPages).toBe(0)
  })

  it('rounds up when total does not divide evenly', () => {
    const r = paginatedResult([], 21, 1, 20)
    expect(r.meta.totalPages).toBe(2)
  })
})
