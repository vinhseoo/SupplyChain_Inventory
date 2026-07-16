const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const IMAGES_DIR = path.join(__dirname, 'images');
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Map the expected Mermaid blocks in each file to descriptive PNG filenames
const fileDiagramMap = {
    'chapter2_part1_requirements.md': [
        'usecase_overall.png',
        'usecase_inbound_outbound.png',
        'usecase_stocktake.png'
    ],
    'chapter2_part2_design.md': [
        'system_architecture.png',
        'class_diagram.png',
        'sequence_auth.png',
        'sequence_inbound.png',
        'sequence_outbound.png',
        'sequence_stocktake.png',
        'erd.png'
    ],
    'chapter3_part2_modules.md': [
        'flowchart_wac.png',
        'flowchart_fefo.png'
    ]
};

const filesToProcess = Object.keys(fileDiagramMap);

filesToProcess.forEach(fileName => {
    const filePath = path.join(__dirname, fileName);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }

    console.log(`Processing ${fileName}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    const diagramNames = fileDiagramMap[fileName];
    let diagramIndex = 0;

    // Regex to capture code blocks starting with ```mermaid and ending with ```
    const mermaidRegex = /```mermaid([\s\S]*?)```/g;
    
    // We will build the new content by replacing matches
    let match;
    let newContent = content;
    
    // Create a copy of the regex for matching
    const matches = [];
    while ((match = mermaidRegex.exec(content)) !== null) {
        matches.push({
            fullMatch: match[0],
            code: match[1].trim()
        });
    }

    matches.forEach(m => {
        if (diagramIndex >= diagramNames.length) {
            console.warn(`Warning: More Mermaid blocks found in ${fileName} than defined in map.`);
            return;
        }

        const imgName = diagramNames[diagramIndex++];
        const tempMmdPath = path.join(__dirname, `temp_${imgName.replace('.png', '.mmd')}`);
        const outImgPath = path.join(IMAGES_DIR, imgName);

        // Write the raw Mermaid code to a temporary .mmd file
        fs.writeFileSync(tempMmdPath, m.code, 'utf8');

        console.log(`  -> Compiling diagram to ${imgName}...`);
        
        // Attempt to run npx @mermaid-js/mermaid-cli. 
        // We use npx.cmd on Windows to bypass potential security issues, or fall back to standard npx.
        let success = false;
        const commands = [
            `npx.cmd -y @mermaid-js/mermaid-cli -i "${tempMmdPath}" -o "${outImgPath}" --theme default`,
            `npx -y @mermaid-js/mermaid-cli -i "${tempMmdPath}" -o "${outImgPath}" --theme default`
        ];

        for (const cmd of commands) {
            try {
                execSync(cmd, { stdio: 'ignore' });
                success = true;
                break;
            } catch (err) {
                // Try next command
            }
        }

        if (success) {
            console.log(`  [OK] Successfully generated ${imgName}`);
            // Replace the mermaid block with the Markdown image reference
            // Using relative path to images directory for Word compilation
            newContent = newContent.replace(m.fullMatch, `![${imgName.split('.')[0]}](images/${imgName})`);
        } else {
            console.error(`  [ERROR] Failed to compile diagram ${imgName} using mermaid-cli.`);
        }

        // Clean up the temporary file
        if (fs.existsSync(tempMmdPath)) {
            fs.unlinkSync(tempMmdPath);
        }
    });

    // Write the modified file with suffix _img.md
    const outputFileName = fileName.replace('.md', '_img.md');
    fs.writeFileSync(path.join(__dirname, outputFileName), newContent, 'utf8');
    console.log(`Finished ${fileName} -> Created ${outputFileName}\n`);
});

console.log("All diagram compilations completed.");
