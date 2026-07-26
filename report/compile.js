const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const https = require('https');
const { marked } = require('marked');
const HTMLtoDOCX = require('html-to-docx');

function encodeKroki(source) {
  const buffer = Buffer.from(source, 'utf8');
  const compressed = zlib.deflateSync(buffer, { level: 9 });
  return compressed.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: Status ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function renderMermaidBlocks(mdContent) {
  const mermaidRegex = /```mermaid\r?\n([\s\S]*?)\r?\n```/g;
  let match;
  const replacements = [];
  let index = 0;

  const imagesDir = path.join(__dirname, 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const matches = [];
  while ((match = mermaidRegex.exec(mdContent)) !== null) {
    matches.push({
      fullMatch: match[0],
      code: match[1].trim()
    });
  }

  for (const item of matches) {
    const code = item.code;
    const hash = crypto.createHash('md5').update(code).digest('hex');
    const fileName = `mermaid_${hash}.png`;
    const localImgPath = path.join(imagesDir, fileName);
    const relativeImgPath = `images/${fileName}`;

    if (!fs.existsSync(localImgPath)) {
      console.log(`Rendering Mermaid diagram ${index + 1} to local PNG...`);
      const encoded = encodeKroki(code);
      const url = `https://kroki.io/mermaid/png/${encoded}`;
      try {
        await downloadImage(url, localImgPath);
        console.log(`Successfully saved: ${fileName}`);
      } catch (err) {
        console.error(`Error rendering diagram ${index + 1} via Kroki:`, err.message);
      }
    } else {
      console.log(`Using cached Mermaid diagram: ${fileName}`);
    }

    replacements.push({
      original: item.fullMatch,
      replacement: `\n\n![Mermaid Diagram ${index + 1}](${relativeImgPath})\n\n`
    });

    index++;
  }

  let resolvedMd = mdContent;
  for (const { original, replacement } of replacements) {
    resolvedMd = resolvedMd.replace(original, replacement);
  }

  return resolvedMd;
}

async function main() {
  const mdPath = path.join(__dirname, 'Full_Report.md');
  const docxPath = path.join(__dirname, 'Full_Report.docx');

  console.log('Reading Full_Report.md...');
  let mdContent = fs.readFileSync(mdPath, 'utf8');

  console.log('Resolving chapter imports...');
  const ch1Path = path.join(__dirname, 'chapter1.md');
  const ch2Path = path.join(__dirname, 'chapter2.md');
  const ch3Path = path.join(__dirname, 'chapter3.md');

  const ch1Content = fs.readFileSync(ch1Path, 'utf8');
  const ch2Content = fs.readFileSync(ch2Path, 'utf8');
  const ch3Content = fs.readFileSync(ch3Path, 'utf8');

  const cleanChapter = (content) => {
    const lines = content.split('\n');
    if (lines[0].startsWith('# ')) {
      lines.shift();
    }
    return lines.join('\n');
  };

  // Replace chapter references with actual contents
  mdContent = mdContent.replace(/\*\(Nội dung chi tiết được biên soạn tại \[chapter1\.md\].*?\)\*/g, cleanChapter(ch1Content));
  mdContent = mdContent.replace(/\*\(Nội dung chi tiết được biên soạn tại \[chapter2\.md\].*?\)\*/g, cleanChapter(ch2Content));
  mdContent = mdContent.replace(/\*\(Nội dung chi tiết được biên soạn tại \[chapter3\.md\].*?\)\*/g, cleanChapter(ch3Content));

  console.log('Rendering Mermaid code blocks to PNG via Kroki API...');
  mdContent = await renderMermaidBlocks(mdContent);

  console.log('Converting Markdown to HTML...');
  let htmlContent = marked(mdContent);

  // Parse local images and convert to base64 data URIs
  console.log('Parsing images and embedding as base64...');
  const imgRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g;
  let match;
  const imgReplacements = [];

  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const originalTag = match[0];
    const imgPath = match[1];

    if (!imgPath.startsWith('http') && !imgPath.startsWith('data:')) {
      const absoluteImgPath = path.isAbsolute(imgPath) ? imgPath : path.resolve(__dirname, imgPath);
      if (fs.existsSync(absoluteImgPath)) {
        console.log(`Embedding local image: ${imgPath}`);
        const imgBuffer = fs.readFileSync(absoluteImgPath);
        const imgBase64 = imgBuffer.toString('base64');
        const ext = path.extname(absoluteImgPath).substring(1);
        const dataUri = `data:image/${ext};base64,${imgBase64}`;

        const newTag = originalTag.replace(`src="${imgPath}"`, `src="${dataUri}"`);
        imgReplacements.push({ originalTag, newTag });
      } else {
        console.warn(`Warning: Image file not found at ${absoluteImgPath}`);
      }
    }
  }

  for (const { originalTag, newTag } of imgReplacements) {
    htmlContent = htmlContent.replace(originalTag, newTag);
  }

  // Wrap in HTML template with PTIT formatting styles
  const styledHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @page {
          size: A4;
          margin-top: 2cm;
          margin-bottom: 2cm;
          margin-left: 3cm;
          margin-right: 1.5cm;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 13pt;
          line-height: 1.5;
          color: #000000;
        }
        h1 {
          font-size: 16pt;
          font-weight: bold;
          text-transform: uppercase;
          text-align: center;
          margin-top: 24pt;
          margin-bottom: 12pt;
          page-break-before: always;
        }
        h2 {
          font-size: 14pt;
          font-weight: bold;
          text-align: left;
          margin-top: 18pt;
          margin-bottom: 6pt;
        }
        h3 {
          font-size: 13pt;
          font-weight: bold;
          text-align: left;
          margin-top: 12pt;
          margin-bottom: 6pt;
        }
        p {
          text-indent: 1cm;
          margin-top: 0;
          margin-bottom: 3pt;
          text-align: justify;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12pt;
          margin-bottom: 12pt;
        }
        th, td {
          border: 1px solid #000000;
          padding: 6px;
          font-size: 11pt;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
          text-align: center;
        }
        img {
          display: block;
          margin: 12pt auto;
          max-width: 100%;
          height: auto;
          text-align: center;
        }
        .figure-title {
          font-size: 12pt;
          font-style: italic;
          text-align: center;
          margin-top: 6pt;
          margin-bottom: 12pt;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

  console.log('Generating DOCX file using html-to-docx...');
  const fileBuffer = await HTMLtoDOCX(styledHtml, null, {
    table: { row: { cantSplit: true } },
    footer: true,
    pageNumber: true,
  });

  try {
    fs.writeFileSync(docxPath, fileBuffer);
    console.log('Full_Report.docx created successfully!');
  } catch (err) {
    if (err.code === 'EBUSY') {
      const backupDocxPath = path.join(__dirname, 'Full_Report_v2.docx');
      console.warn(`Warning: Full_Report.docx is locked. Writing to backup file: ${backupDocxPath}`);
      fs.writeFileSync(backupDocxPath, fileBuffer);
      console.log('Full_Report_v2.docx created successfully!');
    } else {
      throw err;
    }
  }
}

main().catch(err => {
  console.error('Error during DOCX compilation:', err);
  process.exit(1);
});
