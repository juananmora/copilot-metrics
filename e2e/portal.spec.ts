import { test, expect } from '@playwright/test';

// ============================================================================
// E2E Tests - Copilot Metrics Portal
// ============================================================================

const sections = [
  { name: 'Overview', path: '/', expectedTitle: 'GitHub Copilot' },
  { name: 'Pull Requests', path: '/pull-requests', expectedTitle: 'GitHub Copilot' },
  { name: 'Custom Agents', path: '/agents', expectedTitle: 'GitHub Copilot' },
  { name: 'Usuarios', path: '/users', expectedTitle: 'GitHub Copilot' },
  { name: 'Executive', path: '/executive', expectedTitle: 'GitHub Copilot' },
  { name: 'Settings', path: '/settings', expectedTitle: 'GitHub Copilot' },
];

// ============================================================================
// FEATURE: Performance Tests - Verifica que todas las páginas cargan rápido
// ============================================================================
test.describe('Feature: Performance', () => {
  for (const section of sections) {
    test(`Scenario: ${section.name} carga en menos de 5 segundos`, async ({ page }) => {
      const startTime = Date.now();
      await page.goto(section.path);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = (Date.now() - startTime) / 1000;
      
      expect(loadTime, `${section.name} took ${loadTime}s to load`).toBeLessThan(5);
      console.log(`✓ ${section.name}: ${loadTime.toFixed(2)}s`);
    });
  }
});

// ============================================================================
// FEATURE: Basic Page Load - Verifica que las páginas tienen contenido
// ============================================================================
test.describe('Feature: Basic Page Load', () => {
  for (const section of sections) {
    test(`Scenario: ${section.name} tiene contenido visible`, async ({ page }) => {
      await page.goto(section.path);
      await page.waitForLoadState('domcontentloaded');
      
      // Verificar que la página tiene contenido
      await expect(page.locator('body')).toBeVisible();
      const content = await page.locator('body').textContent();
      expect(content?.length).toBeGreaterThan(0);
    });
  }
});

// ============================================================================
// FEATURE: Error Handling
// ============================================================================
test.describe('Feature: Error Handling', () => {
  test('Scenario: Página 404 no rompe la aplicación', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // App should still render something (either 404 or redirect)
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============================================================================
// FEATURE: Title Verification
// ============================================================================
test.describe('Feature: Title', () => {
  test('Scenario: La página principal tiene título correcto', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveTitle(/GitHub Copilot|Copilot Metrics|Vite/i);
  });
});
