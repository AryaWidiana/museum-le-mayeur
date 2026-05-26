/**
 * Image Optimization Script for Museum Le Mayeur
 * Converts all PNG/JPG images to WebP format with appropriate resizing.
 * Run: node scripts/optimize-images.js
 */

import sharp from 'sharp'
import { readdir, mkdir, stat } from 'fs/promises'
import { join, basename, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')

const ASSETS_ROOT = join(ROOT, 'assets')        // /assets (root-level)
const ASSETS_SRC = join(ROOT, 'src', 'assets')   // /src/assets
const OUTPUT_DIR = join(ASSETS_SRC, 'optimized')  // /src/assets/optimized

// Config per folder
const CONFIG = {
  'galeri': { maxWidth: 800, quality: 72 },
  'sejarah': { maxWidth: 600, quality: 78 },
  'tentang-museum': { maxWidth: 800, quality: 78 },
  '_root': { maxWidth: 1920, quality: 75 },
}

async function ensureDir(dir) {
  try { await mkdir(dir, { recursive: true }) } catch {}
}

async function getFileSize(path) {
  const s = await stat(path)
  return s.size
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

async function optimizeImage(inputPath, outputPath, config) {
  const { maxWidth, quality } = config
  await sharp(inputPath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(outputPath)
}

async function processImages(label, dirPath, outputDir, config) {
  await ensureDir(outputDir)

  let files
  try {
    files = await readdir(dirPath)
  } catch {
    return { totalOriginal: 0, totalOptimized: 0 }
  }

  const imageFiles = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f))
  let totalOriginal = 0
  let totalOptimized = 0

  console.log(`\n📂 ${label} (${imageFiles.length} images):`)

  for (const file of imageFiles) {
    const inputPath = join(dirPath, file)
    const outputName = basename(file, extname(file)) + '.webp'
    const outputPath = join(outputDir, outputName)

    const originalSize = await getFileSize(inputPath)
    totalOriginal += originalSize

    try {
      await optimizeImage(inputPath, outputPath, config)
      const optimizedSize = await getFileSize(outputPath)
      totalOptimized += optimizedSize
      const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1)
      console.log(`  ✅ ${file} (${formatSize(originalSize)}) → ${outputName} (${formatSize(optimizedSize)}) [-${reduction}%]`)
    } catch (err) {
      console.error(`  ❌ Error: ${file}: ${err.message}`)
    }
  }

  return { totalOriginal, totalOptimized }
}

async function main() {
  console.log('🎨 Museum Le Mayeur — Image Optimization\n')
  await ensureDir(OUTPUT_DIR)

  let grandOriginal = 0
  let grandOptimized = 0

  // 1. Process src/assets root-level images (heroo-bg.png, stat-bg.png, etc.)
  const r1 = await processImages(
    'src/assets (backgrounds)',
    ASSETS_SRC,
    OUTPUT_DIR,
    CONFIG['_root']
  )
  grandOriginal += r1.totalOriginal
  grandOptimized += r1.totalOptimized

  // 2. Process root assets/ root-level images (Background Visi Misi.png, hero-bg.jpg, etc.)
  const r2 = await processImages(
    'assets/ (root backgrounds)',
    ASSETS_ROOT,
    OUTPUT_DIR,
    CONFIG['_root']
  )
  grandOriginal += r2.totalOriginal
  grandOptimized += r2.totalOptimized

  // 3. Process root assets/ subdirectories (galeri, sejarah, tentang-museum)
  try {
    const rootDirs = await readdir(ASSETS_ROOT, { withFileTypes: true })
    for (const d of rootDirs) {
      if (d.isDirectory()) {
        const config = CONFIG[d.name] || CONFIG['_root']
        const outDir = join(OUTPUT_DIR, d.name)
        const r = await processImages(
          `assets/${d.name}`,
          join(ASSETS_ROOT, d.name),
          outDir,
          config
        )
        grandOriginal += r.totalOriginal
        grandOptimized += r.totalOptimized
      }
    }
  } catch {}

  // 4. Process src/assets subdirectories (if different from root)
  try {
    const srcDirs = await readdir(ASSETS_SRC, { withFileTypes: true })
    for (const d of srcDirs) {
      if (d.isDirectory() && d.name !== 'optimized') {
        const outDir = join(OUTPUT_DIR, d.name)
        // Skip if output dir already has files (already processed from root assets)
        try {
          const existing = await readdir(outDir)
          if (existing.length > 0) {
            console.log(`\n⏭️  src/assets/${d.name} — skipped (already optimized from root)`)
            continue
          }
        } catch {}

        const config = CONFIG[d.name] || CONFIG['_root']
        const r = await processImages(
          `src/assets/${d.name}`,
          join(ASSETS_SRC, d.name),
          outDir,
          config
        )
        grandOriginal += r.totalOriginal
        grandOptimized += r.totalOptimized
      }
    }
  } catch {}

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`📊 TOTAL: ${formatSize(grandOriginal)} → ${formatSize(grandOptimized)}`)
  if (grandOriginal > 0) {
    console.log(`📉 Reduction: ${((1 - grandOptimized / grandOriginal) * 100).toFixed(1)}%`)
  }
  console.log(`${'═'.repeat(60)}`)
}

main().catch(console.error)
