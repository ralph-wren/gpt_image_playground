import { describe, expect, it } from 'vitest'
import { getBlobExtension } from './downloadImages'

describe('downloadImages', () => {
  it('detects png extension when blob MIME is octet-stream', async () => {
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    const blob = new Blob([pngBytes], { type: 'application/octet-stream' })

    await expect(getBlobExtension(blob)).resolves.toBe('png')
  })
})
