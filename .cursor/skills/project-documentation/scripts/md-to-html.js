#!/usr/bin/env node
/**
 * Conversor de Markdown a HTML con soporte para Mermaid
 * 
 * Uso:
 *   node md-to-html.js <directorio_md> <directorio_html>
 *   node md-to-html.js ../../docs/md ../../docs/html
 * 
 * Instalación (una sola vez):
 *   cd .cursor/skills/project-documentation/scripts
 *   npm install
 * 
 * Características:
 *   - Convierte todos los archivos .md a .html
 *   - Mantiene la estructura de directorios
 *   - Renderiza diagramas Mermaid en el navegador
 *   - Aplica estilos CSS modernos
 *   - Genera índice de navegación
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { glob } = require('glob');

// ============================================================================
// Templates HTML
// ============================================================================

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        :root {
            --primary-color: #2563eb;
            --secondary-color: #64748b;
            --background-color: #ffffff;
            --surface-color: #f8fafc;
            --text-color: #1e293b;
            --text-secondary: #64748b;
            --border-color: #e2e8f0;
            --code-bg: #f1f5f9;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: var(--text-color);
            background-color: var(--background-color);
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .nav-breadcrumb {
            margin-bottom: 2rem;
            padding: 1rem;
            background: var(--surface-color);
            border-radius: 8px;
            font-size: 0.875rem;
        }
        
        .nav-breadcrumb a {
            color: var(--primary-color);
            text-decoration: none;
        }
        
        .nav-breadcrumb a:hover { text-decoration: underline; }
        
        h1, h2, h3, h4, h5, h6 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
            line-height: 1.3;
        }
        
        h1 {
            font-size: 2.5rem;
            color: var(--primary-color);
            border-bottom: 3px solid var(--primary-color);
            padding-bottom: 0.5rem;
        }
        
        h2 {
            font-size: 1.875rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
        }
        
        h3 { font-size: 1.5rem; }
        h4 { font-size: 1.25rem; color: var(--secondary-color); }
        
        p { margin-bottom: 1rem; }
        
        a { color: var(--primary-color); text-decoration: none; }
        a:hover { text-decoration: underline; }
        
        ul, ol { margin-bottom: 1rem; padding-left: 2rem; }
        li { margin-bottom: 0.5rem; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            font-size: 0.9rem;
        }
        
        th, td {
            padding: 0.75rem 1rem;
            text-align: left;
            border: 1px solid var(--border-color);
        }
        
        th {
            background-color: var(--surface-color);
            font-weight: 600;
        }
        
        tr:nth-child(even) { background-color: var(--surface-color); }
        tr:hover { background-color: #f1f5f9; }
        
        code {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875rem;
            background-color: var(--code-bg);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
        }
        
        pre {
            background-color: #1e293b;
            color: #e2e8f0;
            padding: 1.5rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1.5rem 0;
        }
        
        pre code {
            background-color: transparent;
            padding: 0;
            color: inherit;
        }
        
        .mermaid {
            background-color: var(--surface-color);
            padding: 1.5rem;
            border-radius: 8px;
            margin: 1.5rem 0;
            text-align: center;
        }
        
        blockquote {
            border-left: 4px solid var(--primary-color);
            margin: 1.5rem 0;
            padding: 1rem 1.5rem;
            background-color: var(--surface-color);
            border-radius: 0 8px 8px 0;
        }
        
        blockquote p:last-child { margin-bottom: 0; }
        
        hr {
            border: none;
            border-top: 1px solid var(--border-color);
            margin: 2rem 0;
        }
        
        img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 1rem 0;
        }
        
        .doc-footer {
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border-color);
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.875rem;
        }
        
        @media (max-width: 768px) {
            body { padding: 1rem; }
            h1 { font-size: 1.875rem; }
            h2 { font-size: 1.5rem; }
            table { display: block; overflow-x: auto; }
        }
        
        @media print {
            body { max-width: none; padding: 0; }
            .nav-breadcrumb { display: none; }
            pre { white-space: pre-wrap; }
        }
    </style>
</head>
<body>
    {{breadcrumb}}
    <article>
        {{content}}
    </article>
    <footer class="doc-footer">
        <p>Documentación generada automáticamente el {{date}}</p>
    </footer>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'neutral',
            securityLevel: 'loose',
            flowchart: { useMaxWidth: true, htmlLabels: true }
        });
    </script>
</body>
</html>`;

const INDEX_TEMPLATE = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - Índice</title>
    <style>
        :root {
            --primary-color: #2563eb;
            --secondary-color: #64748b;
            --background-color: #ffffff;
            --surface-color: #f8fafc;
            --text-color: #1e293b;
            --border-color: #e2e8f0;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: var(--text-color);
            background-color: var(--background-color);
            padding: 2rem;
            max-width: 1000px;
            margin: 0 auto;
        }
        
        h1 {
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 2rem;
            border-bottom: 3px solid var(--primary-color);
            padding-bottom: 0.5rem;
        }
        
        .section {
            background: var(--surface-color);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }
        
        .section h3 {
            color: var(--secondary-color);
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1rem;
        }
        
        ul { list-style: none; }
        
        li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        li:last-child { border-bottom: none; }
        
        a {
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 500;
        }
        
        a:hover { text-decoration: underline; }
        
        .file-path {
            color: var(--secondary-color);
            font-size: 0.875rem;
            margin-left: 0.5rem;
        }
        
        .footer {
            margin-top: 3rem;
            text-align: center;
            color: var(--secondary-color);
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <h1>{{title}}</h1>
    {{sections}}
    <footer class="footer">
        <p>Documentación generada el {{date}}</p>
    </footer>
</body>
</html>`;

// ============================================================================
// Funciones de conversión
// ============================================================================

/**
 * Extrae y guarda bloques Mermaid, reemplazándolos con placeholders
 */
function extractMermaidBlocks(content) {
    const mermaidBlocks = [];
    // Soporta \n (Unix) y \r\n (Windows)
    const processed = content.replace(/```mermaid\r?\n([\s\S]*?)```/g, (match, code) => {
        const placeholder = `<!--MERMAID_PLACEHOLDER_${mermaidBlocks.length}-->`;
        mermaidBlocks.push(code.trim());
        return placeholder;
    });
    return { processed, mermaidBlocks };
}

/**
 * Restaura los bloques Mermaid desde los placeholders
 */
function restoreMermaidBlocks(html, mermaidBlocks) {
    let result = html;
    mermaidBlocks.forEach((code, index) => {
        const placeholder = `<!--MERMAID_PLACEHOLDER_${index}-->`;
        // Escapar caracteres HTML especiales en el código Mermaid
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        // Pero Mermaid necesita el código sin escapar, así que usamos el original
        const mermaidDiv = `<div class="mermaid">\n${code}\n</div>`;
        result = result.replace(placeholder, mermaidDiv);
    });
    return result;
}

/**
 * Extrae el título del documento desde el primer H1
 */
function extractTitle(content, filename) {
    const match = content.match(/^#\s+(.+)$/m);
    if (match) {
        return match[1].trim();
    }
    return filename.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Genera navegación breadcrumb
 */
function generateBreadcrumb(relativePath, rootName = 'Inicio') {
    const parts = relativePath.split(path.sep).filter(Boolean);
    if (parts.length === 0) return '';
    
    const breadcrumbs = [`<a href="index.html">${rootName}</a>`];
    
    for (let i = 0; i < parts.length - 1; i++) {
        const levelsUp = parts.length - i - 1;
        const href = '../'.repeat(levelsUp) + 'index.html';
        breadcrumbs.push(`<a href="${href}">${parts[i]}</a>`);
    }
    
    // Último elemento sin link
    const lastPart = parts[parts.length - 1].replace('.html', '');
    breadcrumbs.push(`<span>${lastPart}</span>`);
    
    return `<nav class="nav-breadcrumb">${breadcrumbs.join(' / ')}</nav>`;
}

/**
 * Convierte un archivo Markdown a HTML
 */
function convertFile(inputPath, outputPath, relativePath) {
    let content = fs.readFileSync(inputPath, 'utf-8');
    
    // Extraer título
    const title = extractTitle(content, path.basename(inputPath));
    
    // IMPORTANTE: Extraer bloques Mermaid ANTES de procesar con marked
    // para evitar que se corrompan con etiquetas <pre><code>
    const { processed, mermaidBlocks } = extractMermaidBlocks(content);
    content = processed;
    
    // Convertir enlaces .md a .html
    content = content.replace(/\]\(([^)]+)\.md\)/g, ']($1.html)');
    
    // Configurar marked
    marked.setOptions({
        gfm: true,
        breaks: false,
        headerIds: true,
        mangle: false
    });
    
    // Convertir a HTML
    let htmlContent = marked.parse(content);
    
    // Restaurar bloques Mermaid después del procesamiento
    htmlContent = restoreMermaidBlocks(htmlContent, mermaidBlocks);
    
    // Generar breadcrumb
    const breadcrumb = generateBreadcrumb(relativePath);
    
    // Aplicar template
    const date = new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const finalHtml = HTML_TEMPLATE
        .replace('{{title}}', title)
        .replace('{{content}}', htmlContent)
        .replace('{{breadcrumb}}', breadcrumb)
        .replace('{{date}}', date);
    
    // Crear directorio de salida si no existe
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Escribir archivo
    fs.writeFileSync(outputPath, finalHtml, 'utf-8');
    
    return { title, path: outputPath, relativePath };
}

/**
 * Genera un archivo índice HTML
 */
function generateIndex(files, outputDir, title = 'Documentación del Proyecto') {
    // Agrupar archivos por directorio
    const sections = {};
    
    for (const fileInfo of files) {
        const parts = fileInfo.relativePath.split(path.sep);
        const section = parts.length > 1 ? parts[0] : 'General';
        
        if (!sections[section]) {
            sections[section] = [];
        }
        sections[section].push(fileInfo);
    }
    
    // Generar HTML de secciones
    let sectionsHtml = '';
    
    for (const [sectionName, sectionFiles] of Object.entries(sections).sort()) {
        const items = sectionFiles
            .sort((a, b) => a.title.localeCompare(b.title))
            .map(f => `<li>
                <a href="${f.relativePath}">${f.title}</a>
                <span class="file-path">${f.relativePath}</span>
            </li>`)
            .join('\n');
        
        sectionsHtml += `<div class="section">
            <h3>${sectionName}</h3>
            <ul>${items}</ul>
        </div>\n`;
    }
    
    // Generar fecha
    const date = new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Generar índice
    const indexHtml = INDEX_TEMPLATE
        .replace(/\{\{title\}\}/g, title)
        .replace('{{sections}}', sectionsHtml)
        .replace('{{date}}', date);
    
    const indexPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(indexPath, indexHtml, 'utf-8');
    
    console.log(`✓ Índice generado: ${indexPath}`);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Uso: node md-to-html.js <directorio_md> <directorio_html>');
        console.log('Ejemplo: node md-to-html.js ../../docs/md ../../docs/html');
        process.exit(1);
    }
    
    const inputDir = path.resolve(args[0]);
    const outputDir = path.resolve(args[1]);
    
    if (!fs.existsSync(inputDir)) {
        console.error(`Error: El directorio '${inputDir}' no existe`);
        process.exit(1);
    }
    
    // Crear directorio de salida
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Buscar todos los archivos .md
    const pattern = path.join(inputDir, '**/*.md').replace(/\\/g, '/');
    const mdFiles = await glob(pattern);
    
    if (mdFiles.length === 0) {
        console.log(`No se encontraron archivos .md en '${inputDir}'`);
        process.exit(1);
    }
    
    console.log(`Convirtiendo ${mdFiles.length} archivo(s)...`);
    
    const convertedFiles = [];
    
    for (const mdFile of mdFiles) {
        // Calcular ruta relativa
        const relativePath = path.relative(inputDir, mdFile);
        
        // Cambiar extensión a .html
        const htmlRelative = relativePath.replace(/\.md$/, '.html');
        const outputPath = path.join(outputDir, htmlRelative);
        
        try {
            const fileInfo = convertFile(mdFile, outputPath, htmlRelative);
            convertedFiles.push(fileInfo);
            console.log(`✓ ${mdFile} → ${outputPath}`);
        } catch (error) {
            console.error(`✗ Error procesando ${mdFile}: ${error.message}`);
        }
    }
    
    // Generar índice
    if (convertedFiles.length > 0) {
        generateIndex(convertedFiles, outputDir);
    }
    
    console.log(`\n¡Conversión completada! ${convertedFiles.length} archivos generados en '${outputDir}'`);
}

main().catch(console.error);
