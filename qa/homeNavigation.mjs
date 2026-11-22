/** Follow visible menu actions, supporting both the old and grouped home. */
export async function openHomeMode(page, name) {
  const action = page.getByRole('button',{name,exact:true});
  if (!await action.isVisible().catch(()=>false)) await page.getByRole('button',{name:/^(Otros modos|Other modes)$/}).click();
  await page.getByRole('button',{name,exact:true}).click();
}
export async function waitForHome(page) { await page.getByRole('heading',{name:'DOMINIX',exact:true}).waitFor(); }
