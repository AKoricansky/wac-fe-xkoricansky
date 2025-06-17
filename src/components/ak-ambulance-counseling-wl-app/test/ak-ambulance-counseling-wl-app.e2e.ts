import { newE2EPage } from '@stencil/core/testing';

describe('ak-ambulance-counseling-wl-app', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ak-ambulance-counseling-wl-app></ak-ambulance-counseling-wl-app>');

    const element = await page.find('ak-ambulance-counseling-wl-app');
    expect(element).toHaveClass('hydrated');
  });
});
