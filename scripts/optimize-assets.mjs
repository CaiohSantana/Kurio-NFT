import sharp from 'sharp'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

// Encode the original pixels losslessly; preserve original exports and PNGs.
await mkdir('public/assets/optimized', { recursive: true })
const assets = []
for (const name of ['83794', '8f387', '9add2', 'b7cfc']) {
  const source = `public/assets/figma/${name}.png`, target = `public/assets/optimized/${name}.webp`
  await sharp(source).webp({ lossless: true, effort: 6 }).toFile(target)
  const variants = []
  for (const width of [450, 900]) {
    const variant = `public/assets/optimized/${name}-${width}.webp`
    await sharp(source).resize({ width, withoutEnlargement: true }).webp({ lossless: true, effort: 6 }).toFile(variant)
    const encoded = await readFile(variant)
    variants.push({ width, target: variant, targetBytes: encoded.length, sha256: createHash('sha256').update(encoded).digest('hex') })
  }
  const input = await readFile(source), output = await readFile(target)
  const originalPixels = await sharp(source).raw().toBuffer(), encodedPixels = await sharp(target).raw().toBuffer()
  if (!originalPixels.equals(encodedPixels)) throw Error(`Lossless verification failed: ${source}`)
  assets.push({ source, target, sourceBytes: input.length, targetBytes: output.length, sourceSha256: createHash('sha256').update(input).digest('hex'), targetSha256: createHash('sha256').update(output).digest('hex'), originalPixelsPreserved: true, variants })
}
await writeFile('public/assets/optimized/manifest.json', JSON.stringify({ encoder: 'sharp 0.35.5; WebP lossless effort 6; full resolution plus 450/900px resamples; no artwork changes', assets }, null, 2))
