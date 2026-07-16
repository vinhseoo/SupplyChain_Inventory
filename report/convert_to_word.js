const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const HTMLtoDOCX = require('html-to-docx');

async function convert() {
    const mdPath = path.join(__dirname, 'Full_Report_Image.md');
    if (!fs.existsSync(mdPath)) {
        console.error("Error: Full_Report_Image.md not found!");
        return;
    }
    
    console.log("Reading Full_Report_Image.md...");
    let mdContent = fs.readFileSync(mdPath, 'utf8');
    
    // Parse Markdown to HTML
    console.log("Parsing Markdown to HTML...");
    let htmlContent = marked(mdContent);

    // 1. Flatten code blocks to simple paragraphs to avoid html-to-docx parsing errors
    console.log("Formatting code blocks for DOCX compatibility...");
    htmlContent = htmlContent.replace(/<pre><code class="[^"]*">([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
        const escaped = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\n/g, '<br/>')
            .replace(/ /g, '&nbsp;');
        return `<p style="font-family: 'Courier New'; font-size: 11pt; background-color: #f5f5f5; border: 1px solid #cccccc; padding: 8px; line-height: 1.2;">${escaped}</p>`;
    });

    htmlContent = htmlContent.replace(/<code>(.*?)<\/code>/g, '<span style="font-family: \'Courier New\'; background-color: #f5f5f5; padding: 2px 4px;">$1</span>');
    
    // 2. Convert local PNG images to Base64 Data URIs
    console.log("Embedding compiled diagram images as Base64...");
    const htmlImgRegex = /<img src="([^"]+)" alt="([^"]*)"\s*\/?>/g;
    
    htmlContent = htmlContent.replace(htmlImgRegex, (match, imgPath, altText) => {
        const decodedPath = decodeURIComponent(imgPath).replace(/\\/g, '/');
        const imgAbsolutePath = path.join(__dirname, decodedPath);
        
        if (fs.existsSync(imgAbsolutePath)) {
            const imgBuffer = fs.readFileSync(imgAbsolutePath);
            const imgBase64 = imgBuffer.toString('base64');
            const dataUri = `data:image/png;base64,${imgBase64}`;
            
            // Return raw img tag and a caption paragraph. Avoid wrapper divs to prevent parser crash.
            return `<img src="${dataUri}" alt="${altText}" />
<p style="text-align: center; font-size: 11pt; font-style: italic; color: #555555; margin-top: 5pt; margin-bottom: 15pt;">Hình: ${altText || 'Sơ đồ minh họa'}</p>`;
        } else {
            console.warn(`Warning: Image file not found: ${imgAbsolutePath}`);
            return match;
        }
    });

    // 3. Apply text alignment formatting (Justified alignment)
    console.log("Formatting text alignment (Justified)...");
    
    // Target only plain <p> tags, leaving custom style paragraphs (like image captions) untouched
    htmlContent = htmlContent.replace(/<p>/g, '<p style="text-align: justify; line-height: 1.5; margin-bottom: 8pt;">');
    htmlContent = htmlContent.replace(/<li>/g, '<li style="text-align: justify; line-height: 1.5; margin-bottom: 4pt;">');
    
    // Setup clean table borders for Word
    htmlContent = htmlContent.replace(/<table>/g, '<table style="border: 1px solid #000000; border-collapse: collapse; width: 100%;">');
    htmlContent = htmlContent.replace(/<th>/g, '<th style="border: 1px solid #000000; padding: 8px; background-color: #f2f2f2; font-weight: bold; text-align: center;">');
    htmlContent = htmlContent.replace(/<td>/g, '<td style="border: 1px solid #000000; padding: 8px; text-align: left;">');

    // 4. Convert HTML to DOCX
    console.log("Compiling final HTML to DOCX...");
    const docxBuffer = await HTMLtoDOCX(htmlContent, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        header: true,
        pageNumber: true,
        font: 'Times New Roman',
        fontSize: 28, // 14pt (unit in half-points: 14 * 2 = 28)
        orientation: 'portrait',
        margins: {
            top: 1440,    // 1 inch
            bottom: 1440, // 1 inch
            left: 1440,   // 1 inch
            right: 1440   // 1 inch
        }
    });
    
    const docxOutputPath = path.join(__dirname, 'Full_Report.docx');
    fs.writeFileSync(docxOutputPath, docxBuffer);
    console.log("\nSUCCESS: Word document created successfully at:");
    console.log(docxOutputPath);
}

convert().catch(console.error);
