/**
 * E2E Report Generator
 * 
 * Genera un informe HTML a partir de los resultados de tests E2E.
 * 
 * Uso:
 *   node generate-report.js <results.json> [output-path]
 * 
 * Input JSON structure:
 * {
 *   "timestamp": "2024-01-15T10:30:00Z",
 *   "baseUrl": "http://localhost:5173",
 *   "sections": [
 *     {
 *       "name": "Dashboard",
 *       "url": "/dashboard",
 *       "functionality": {
 *         "passed": 5,
 *         "failed": 1,
 *         "tests": [
 *           { "name": "Page loads", "status": "passed", "gherkin": "..." },
 *           { "name": "KPIs visible", "status": "failed", "error": "...", "gherkin": "..." }
 *         ]
 *       },
 *       "accessibility": {
 *         "passed": 10,
 *         "failed": 2,
 *         "issues": [
 *           { "severity": "serious", "description": "...", "element": "..." }
 *         ]
 *       },
 *       "performance": {
 *         "loadTime": 1.5,
 *         "renderTime": 0.8,
 *         "domElements": 450
 *       }
 *     }
 *   ]
 * }
 */

const fs = require('fs');
const path = require('path');

// Template path (relative to this script)
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'report-template.html');

function generateReport(resultsPath, outputPath) {
  // Read results
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  
  // Read template
  let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  
  // Calculate totals
  const totals = calculateTotals(results.sections);
  
  // Replace placeholders
  template = replacePlaceholders(template, results, totals);
  
  // Generate sections HTML
  template = generateSectionsHtml(template, results.sections);
  
  // Generate Gherkin content
  const gherkinContent = generateGherkinContent(results.sections);
  template = template.replace('{{GHERKIN_CONTENT}}', escapeHtml(gherkinContent));
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write HTML report
  fs.writeFileSync(outputPath, template);
  
  // Write Gherkin file
  const gherkinDir = path.join(outputDir, 'gherkin');
  if (!fs.existsSync(gherkinDir)) {
    fs.mkdirSync(gherkinDir, { recursive: true });
  }
  fs.writeFileSync(path.join(gherkinDir, 'all-features.feature'), gherkinContent);
  
  console.log(`Report generated: ${outputPath}`);
  console.log(`Gherkin file: ${path.join(gherkinDir, 'all-features.feature')}`);
  
  return { reportPath: outputPath, gherkinPath: path.join(gherkinDir, 'all-features.feature') };
}

function calculateTotals(sections) {
  let totalPassed = 0;
  let totalFailed = 0;
  let funcPassed = 0;
  let funcTotal = 0;
  let a11yIssues = 0;
  let totalLoadTime = 0;
  
  sections.forEach(section => {
    funcPassed += section.functionality.passed;
    funcTotal += section.functionality.passed + section.functionality.failed;
    totalPassed += section.functionality.passed + section.accessibility.passed;
    totalFailed += section.functionality.failed + section.accessibility.failed;
    a11yIssues += section.accessibility.issues?.length || 0;
    totalLoadTime += section.performance.loadTime;
  });
  
  const funcPercent = funcTotal > 0 ? Math.round((funcPassed / funcTotal) * 100) : 0;
  const avgLoadTime = sections.length > 0 ? (totalLoadTime / sections.length).toFixed(2) : 0;
  const passPercent = (totalPassed + totalFailed) > 0 
    ? Math.round((totalPassed / (totalPassed + totalFailed)) * 100) 
    : 0;
  
  return {
    totalTests: totalPassed + totalFailed,
    passed: totalPassed,
    failed: totalFailed,
    funcPassed,
    funcTotal,
    funcPercent,
    a11yIssues,
    avgLoadTime,
    passPercent,
    sectionCount: sections.length
  };
}

function getStatus(value, goodThreshold, badThreshold) {
  if (typeof value === 'number') {
    if (value >= goodThreshold) return 'success';
    if (value <= badThreshold) return 'error';
    return 'warning';
  }
  return value === 0 ? 'success' : 'error';
}

function replacePlaceholders(template, results, totals) {
  const timestamp = new Date(results.timestamp).toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });
  
  const replacements = {
    '{{TIMESTAMP}}': timestamp,
    '{{YEAR}}': new Date().getFullYear(),
    '{{TOTAL_TESTS}}': totals.totalTests,
    '{{PASSED_TESTS}}': totals.passed,
    '{{FAILED_TESTS}}': totals.failed,
    '{{TOTAL_STATUS}}': totals.failed === 0 ? 'success' : 'error',
    '{{FUNC_PERCENT}}': totals.funcPercent,
    '{{FUNC_PASSED}}': totals.funcPassed,
    '{{FUNC_TOTAL}}': totals.funcTotal,
    '{{FUNC_STATUS}}': totals.funcPercent >= 90 ? 'success' : (totals.funcPercent >= 70 ? 'warning' : 'error'),
    '{{A11Y_ISSUES}}': totals.a11yIssues,
    '{{A11Y_STATUS}}': totals.a11yIssues === 0 ? 'success' : (totals.a11yIssues <= 3 ? 'warning' : 'error'),
    '{{AVG_LOAD_TIME}}': totals.avgLoadTime,
    '{{PERF_STATUS}}': totals.avgLoadTime < 2 ? 'success' : (totals.avgLoadTime < 3 ? 'warning' : 'error'),
    '{{PASS_PERCENT}}': totals.passPercent,
    '{{PROGRESS_STATUS}}': totals.passPercent >= 90 ? 'success' : (totals.passPercent >= 70 ? 'warning' : 'error'),
    '{{SECTION_COUNT}}': totals.sectionCount
  };
  
  for (const [placeholder, value] of Object.entries(replacements)) {
    template = template.replace(new RegExp(escapeRegex(placeholder), 'g'), value);
  }
  
  return template;
}

function generateSectionsHtml(template, sections) {
  const sectionTemplate = extractTemplate(template, '{{#SECTIONS}}', '{{/SECTIONS}}');
  const funcTestTemplate = extractTemplate(sectionTemplate, '{{#FUNC_TESTS}}', '{{/FUNC_TESTS}}');
  const a11yTemplate = extractTemplate(sectionTemplate, '{{#A11Y_ISSUES}}', '{{/A11Y_ISSUES}}');
  
  let sectionsHtml = '';
  
  sections.forEach(section => {
    let sectionHtml = sectionTemplate;
    
    // Section info
    const sectionStatus = section.functionality.failed === 0 ? 'passed' : 'failed';
    sectionHtml = sectionHtml
      .replace('{{SECTION_NAME}}', section.name)
      .replace('{{SECTION_URL}}', section.url)
      .replace(new RegExp('{{SECTION_STATUS}}', 'g'), sectionStatus)
      .replace('{{SECTION_STATUS_TEXT}}', sectionStatus === 'passed' ? 'Passed' : 'Failed');
    
    // Functionality tests
    let funcTestsHtml = '';
    section.functionality.tests.forEach(test => {
      funcTestsHtml += funcTestTemplate
        .replace('{{TEST_NAME}}', test.name)
        .replace(new RegExp('{{TEST_STATUS}}', 'g'), test.status)
        .replace('{{TEST_DETAILS}}', test.error || '-');
    });
    sectionHtml = sectionHtml.replace(/{{#FUNC_TESTS}}[\s\S]*{{\/FUNC_TESTS}}/g, funcTestsHtml);
    
    // Accessibility issues
    if (section.accessibility.issues && section.accessibility.issues.length > 0) {
      sectionHtml = sectionHtml.replace('{{#HAS_A11Y_ISSUES}}', '').replace('{{/HAS_A11Y_ISSUES}}', '');
      
      let a11yHtml = '';
      section.accessibility.issues.forEach(issue => {
        a11yHtml += a11yTemplate
          .replace(new RegExp('{{ISSUE_SEVERITY}}', 'g'), issue.severity.toLowerCase())
          .replace('{{ISSUE_DESCRIPTION}}', issue.description)
          .replace('{{ISSUE_ELEMENT}}', escapeHtml(issue.element));
      });
      sectionHtml = sectionHtml.replace(/{{#A11Y_ISSUES}}[\s\S]*{{\/A11Y_ISSUES}}/g, a11yHtml);
    } else {
      sectionHtml = sectionHtml.replace(/{{#HAS_A11Y_ISSUES}}[\s\S]*{{\/HAS_A11Y_ISSUES}}/g, '');
    }
    
    // Performance
    const loadTimeStatus = section.performance.loadTime < 1.5 ? 'good' : 
                          (section.performance.loadTime < 3 ? 'warning' : 'bad');
    const renderTimeStatus = section.performance.renderTime < 1 ? 'good' :
                            (section.performance.renderTime < 2 ? 'warning' : 'bad');
    
    sectionHtml = sectionHtml
      .replace('{{LOAD_TIME}}', section.performance.loadTime.toFixed(2))
      .replace('{{LOAD_TIME_STATUS}}', loadTimeStatus)
      .replace('{{RENDER_TIME}}', section.performance.renderTime.toFixed(2))
      .replace('{{RENDER_TIME_STATUS}}', renderTimeStatus)
      .replace('{{DOM_ELEMENTS}}', section.performance.domElements);
    
    sectionsHtml += sectionHtml;
  });
  
  return template.replace(/{{#SECTIONS}}[\s\S]*{{\/SECTIONS}}/g, sectionsHtml);
}

function generateGherkinContent(sections) {
  let gherkin = `# Auto-generated Gherkin test cases
# Generated: ${new Date().toISOString()}
# Portal: Copilot Metrics Portal - BBVA

`;
  
  sections.forEach(section => {
    gherkin += `Feature: ${section.name}
  Como usuario del portal Copilot Metrics
  Quiero acceder a la sección ${section.name}
  Para visualizar las métricas correspondientes

  Background:
    Given el servidor de desarrollo está corriendo en "localhost:5173"
    And el navegador está abierto

`;
    
    section.functionality.tests.forEach(test => {
      if (test.gherkin) {
        gherkin += `  ${test.gherkin}\n\n`;
      } else {
        // Generate default Gherkin if not provided
        gherkin += `  @${test.status === 'passed' ? 'smoke' : 'regression'}
  Scenario: ${test.name}
    Given que navego a "${section.url}"
    When la página termina de cargar
    Then ${test.status === 'passed' ? 'el contenido se muestra correctamente' : 'se detecta un problema: ' + (test.error || 'error desconocido')}

`;
      }
    });
    
    gherkin += '\n';
  });
  
  return gherkin;
}

function extractTemplate(html, startTag, endTag) {
  const startIndex = html.indexOf(startTag) + startTag.length;
  const endIndex = html.indexOf(endTag);
  return html.substring(startIndex, endIndex);
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node generate-report.js <results.json> [output-path]');
    process.exit(1);
  }
  
  const resultsPath = args[0];
  const outputPath = args[1] || `docs/e2e-reports/e2e-report-${Date.now()}.html`;
  
  try {
    generateReport(resultsPath, outputPath);
  } catch (error) {
    console.error('Error generating report:', error.message);
    process.exit(1);
  }
}

module.exports = { generateReport };
