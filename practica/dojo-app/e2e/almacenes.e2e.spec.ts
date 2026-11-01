import { expect, test } from '@playwright/test';

// El mock acepta el mismo token por default que el dojo-api. Es un valor de
// práctica, público a propósito: nunca pongas tokens reales en un test.
const TOKEN = 'dojo-local-inseguro';

test('entrar, filtrar almacenes y registrar uno nuevo', async ({ page }) => {
  await page.goto('/#/almacenes');
  await expect(page).toHaveURL(/#\/login\?volver=/);

  await page.getByLabel('Token').fill(TOKEN);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Almacenes' })).toBeVisible();

  await page.getByRole('searchbox', { name: 'Buscar por clave o nombre' }).fill('bodega');
  await expect(page.getByRole('row')).toHaveCount(3); // encabezado + 2

  await page.getByRole('link', { name: 'Nuevo almacén' }).click();
  await page.getByLabel('Clave').fill('ALM-50');
  await page.getByLabel('Nombre').fill('Almacén E2E');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('Almacén registrado')).toBeVisible();
});
