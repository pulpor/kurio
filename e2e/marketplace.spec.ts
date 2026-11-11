import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await expect(page.locator('article').first()).toBeVisible();
});

test('catalog state lives in the URL and survives history navigation', async ({ page }) => {
  await page.goto('/?q=Emerald&sort=price_asc');
  await expect(page.getByText(/Emerald Ape/i).first()).toBeVisible();
  await page.goto('/?q=Emerald');
  await page.goBack();
  await expect(page).toHaveURL(/sort=price_asc/);
});

test('direct access to an existing and a missing NFT', async ({ page }) => {
  await page.goto('/nft/emerald-ape-042');
  await expect(page.getByText(/Emerald Ape/i).filter({ visible: true }).first()).toBeVisible();
  await page.goto('/nft/does-not-exist');
  await expect(page.getByText('Obra não encontrada')).toBeVisible();
});

test('unknown routes render the 404 page', async ({ page }) => {
  await page.goto('/rota-inexistente');
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
});

test('private routes redirect to login and return after authentication', async ({ page }) => {
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/login\?redirect=/);
  await page.getByLabel('E-mail').first().fill('contato@email.com');
  await page.getByLabel('Senha', { exact: true }).or(page.getByPlaceholder('***********')).first().fill('123456');
  await page.locator('button[type=submit]', { hasText: 'Entrar' }).first().click();
  await expect(page).toHaveURL(/\/profile/);
});

test('rejects short passwords with an error from the API', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').first().fill('contato@email.com');
  await page.getByPlaceholder('***********').fill('123');
  await page.locator('button[type=submit]', { hasText: 'Entrar' }).first().click();
  await expect(page).toHaveURL(/\/login/);
});

test('nft.updated reaches the UI through the Socket.IO client', async ({ page, isMobile }) => {
  test.skip(isMobile, 'simulation console is opened from the desktop navbar');
  await page.getByRole('button', { name: 'Abrir console de simulação' }).click();
  await page.getByRole('button', { name: /Alterar Preço Emerald Ape/ }).click();
  await expect(page.getByText(/Cotação atualizada/)).toBeVisible();
});

test('stale socket events are discarded', async ({ page, isMobile }) => {
  test.skip(isMobile, 'simulation console is opened from the desktop navbar');
  await page.getByRole('button', { name: 'Abrir console de simulação' }).click();
  await page.getByRole('button', { name: /Alterar Preço Emerald Ape/ }).click();
  await expect(page.getByText(/Cotação atualizada/)).toHaveCount(1);
  await page.getByRole('button', { name: /Evento Obsoleto/ }).click();
  await page.waitForTimeout(500);
  await expect(page.getByText(/Cotação atualizada/)).toHaveCount(1);
});
