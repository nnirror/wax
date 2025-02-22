const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

async function zipWasmFiles() {
    const wasmDir = path.join(__dirname, '../wasm');
    const zip = new JSZip();
    const hash = Math.random().toString(36).substring(2, 10);
    const zipFileName = `wax_devices-${hash}.zip`;
    const zipFilePath = path.join(wasmDir, zipFileName);

    // Read all files in the wasm directory
    const files = fs.readdirSync(wasmDir);

    // Add all JSON files to the zip with compression
    for (const file of files) {
        if (file.endsWith('.json')) {
            const filePath = path.join(wasmDir, file);
            const fileData = fs.readFileSync(filePath);
            zip.file(file, fileData, { compression: 'DEFLATE' });
        }
    }

    // Generate the zip file with compression
    const zipContent = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    // Write the zip file to the wasm directory
    fs.writeFileSync(zipFilePath, zipContent);

    console.log(`Zipped files into: ${zipFileName}`);
}

zipWasmFiles().catch(err => {
    console.error('Error zipping files:', err);
    process.exit(1);
});