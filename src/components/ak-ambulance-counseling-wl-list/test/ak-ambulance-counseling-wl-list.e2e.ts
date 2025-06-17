import { newE2EPage } from '@stencil/core/testing';

describe('ak-ambulance-counseling-wl-list', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ak-ambulance-counseling-wl-list></ak-ambulance-counseling-wl-list>');

    const element = await page.find('ak-ambulance-counseling-wl-list');
    expect(element).toHaveClass('hydrated');
  });
});
