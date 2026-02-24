#!/usr/bin/env node
/**
 * Build script — minifies CSS & JS for production.
 * Run: npm run build
 *
 * Produces *.min.js and styles.min.css alongside source files.
 * index.html already references the minified versions.
 */
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const JS_FILES = [
  'js/i18n.js',
  'js/core.js',
  'js/ui.js',
  'js/grids.js',
  'js/forms.js',
  'js/analytics.js',
];

async function build() {
  const t0 = Date.now();
  let totalBefore = 0;
  let totalAfter = 0;

  /* Minify each JS file */
  for (const file of JS_FILES) {
    const src = fs.readFileSync(file, 'utf8');
    const out = file.replace(/\.js$/, '.min.js');
    const result = await esbuild.transform(src, { minify: true, target: 'es2020', charset: 'utf8' });
    fs.writeFileSync(out, result.code, 'utf8');
    totalBefore += src.length;
    totalAfter += result.code.length;
    console.log(`  ${file} → ${out}  (${src.length} → ${result.code.length})`);
  }

  /* Minify CSS */
  const css = fs.readFileSync('styles.css', 'utf8');
  const cssResult = await esbuild.transform(css, { minify: true, loader: 'css' });
  fs.writeFileSync('styles.min.css', cssResult.code);
  totalBefore += css.length;
  totalAfter += cssResult.code.length;
  console.log(`  styles.css → styles.min.css  (${css.length} → ${cssResult.code.length})`);

  const pct = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
  console.log(`\n  Total: ${totalBefore} → ${totalAfter} bytes  (${pct}% reduction)`);
  console.log(`  Done in ${Date.now() - t0}ms`);
}

build().catch(e => { console.error(e); process.exit(1); });
