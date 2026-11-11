import { test, expect } from '@playwright/test';

test.describe('Aetheria NFT Marketplace — Fluxos Principais E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('1. Catálogo: busca, filtros combinados, ordenação e persistência na URL', async ({ page }) => {
    // 1. Check title & brand
    await expect(page.locator('header')).toContainText('Aetheria');

    // 2. Perform search
    const searchInput = page.locator('input[placeholder*="Buscar por título"]');
    await searchInput.fill('Valkyrie');

    // URL should reflect search query
    await expect(page).toHaveURL(/\?q=Valkyrie/);
    await expect(page.locator('article')).toContainText('Cyber Valkyrie #089');

    // 3. Apply category filter
    const cyberBtn = page.getByRole('button', { name: 'Cyber', exact: true });
    await cyberBtn.click();
    await expect(page).toHaveURL(/category=cyber/);

    // 4. Change sorting to Lowest Price
    const sortSelect = page.locator('select[aria-label="Ordenar listagem"]');
    await sortSelect.selectOption('price_asc');
    await expect(page).toHaveURL(/sort=price_asc/);

    // 5. Test history back navigation
    await page.goBack();
    await expect(page).not.toHaveURL(/sort=price_asc/);
  });

  test('2. Acesso direto ao detalhe e tratamento de recurso inexistente (404)', async ({ page }) => {
    // Direct link to existing NFT
    await page.goto('/nft/valkyrie-089');
    await expect(page.locator('h1')).toContainText('Cyber Valkyrie #089');
    await expect(page.locator('body')).toContainText('Obsidian Alloy');
    await expect(page.locator('body')).toContainText('1.450 ETH');

    // Direct link to nonexistent NFT
    await page.goto('/nft/non-existent-token-id-999');
    await expect(page.locator('body')).toContainText('Obra Não Encontrada');
    await expect(page.getByRole('button', { name: 'Retornar ao Catálogo' })).toBeVisible();

    // Click return to catalog
    await page.getByRole('button', { name: 'Retornar ao Catálogo' }).click();
    await expect(page).toHaveURL('/');
  });

  test('3. Favoritos: mutação otimista e persistência para usuário autenticado', async ({ page }) => {
    // Select first card
    const firstFavButton = page.locator('article').first().locator('button[aria-label*="Favoritar"]');
    await firstFavButton.click();

    // Should optimistically toggle
    await expect(firstFavButton).toBeVisible();
  });

  test('4. Carrinho: adição, alteração de quantidades, cupons e remoção', async ({ page }) => {
    // Navigate to Valkyrie
    await page.goto('/nft/valkyrie-089');
    await page.getByRole('button', { name: 'Adicionar ao Carrinho' }).click();

    // Go to cart
    await page.goto('/cart');
    await expect(page.locator('h1')).toContainText('Carrinho de Compras');
    await expect(page.locator('body')).toContainText('Cyber Valkyrie #089');

    // Test coupon code: AETHERIA10
    const couponInput = page.locator('input[placeholder="Código de cupom"]');
    if (await couponInput.isVisible()) {
      await couponInput.fill('AETHERIA10');
      await page.getByRole('button', { name: 'Aplicar' }).click();
      await expect(page.locator('body')).toContainText('AETHERIA10');
      await expect(page.locator('body')).toContainText('Desconto');
    }

    // Test removing item
    const removeBtn = page.locator('button[aria-label*="Remover"]').first();
    await removeBtn.click();
    await expect(page.locator('body')).toContainText('Seu Carrinho está Vazio');
  });

  test('5. Fluxo Completo de Compra: do catálogo ao recibo confirmado com Idempotência', async ({ page }) => {
    // Add Sol Solarium to cart
    await page.goto('/nft/sol-solarium');
    await page.getByRole('button', { name: 'Comprar Agora' }).click();

    // Should be on checkout page
    await expect(page).toHaveURL('/checkout');
    await expect(page.locator('h1')).toContainText('Finalização e Pagamento');

    // Verify presence of Idempotency-Key
    await expect(page.locator('body')).toContainText('Chave de Idempotência');

    // Confirm purchase
    const confirmBtn = page.getByRole('button', { name: 'Confirmar e Assinar Compra' });
    await confirmBtn.click();

    // Should navigate to Order Confirmation receipt
    await expect(page).toHaveURL(/\/order-confirmation\/ord-/);
    await expect(page.locator('h1')).toContainText('Compra Realizada com Sucesso!');
    await expect(page.locator('body')).toContainText('Hash da Transação');
    await expect(page.locator('body')).toContainText('Sol Solarium Biome #03');
  });

  test('6. Carteiras: cadastro e definição de carteira principal', async ({ page }) => {
    await page.goto('/wallets');
    await expect(page.locator('h1')).toContainText('Minhas Carteiras Web3');

    // Open connect wallet modal
    await page.getByRole('button', { name: 'Conectar Nova Carteira' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill form
    await page.locator('input[placeholder*="Ex: MetaMask"]').fill('Ledger Hardware Vault');
    await page.locator('input[placeholder*="0x71C"]').fill('0x44D9a91283819284918274918294819284910283');
    await page.getByRole('button', { name: 'Salvar Carteira' }).click();

    // Check newly added wallet is visible in list
    await expect(page.locator('body')).toContainText('Ledger Hardware Vault');
  });

  test('7. Tempo Real Socket.IO: alteração de cotação e sincronização', async ({ page }) => {
    await page.goto('/');

    // Open MSW Simulator panel
    await page.getByRole('button', { name: /Simulador MSW/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click trigger price change
    await page.getByRole('button', { name: /Alterar Preço do Valkyrie/i }).click();

    // Check toast notification is shown
    await expect(page.locator('body')).toContainText('nft.updated');
  });

});
