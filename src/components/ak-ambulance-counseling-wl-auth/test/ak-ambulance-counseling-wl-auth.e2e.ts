import { newE2EPage } from '@stencil/core/testing';

describe('ak-ambulance-counseling-wl-auth', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ak-ambulance-counseling-wl-auth></ak-ambulance-counseling-wl-auth>');

    const element = await page.find('ak-ambulance-counseling-wl-auth');
    expect(element).toHaveClass('hydrated');
  });
});
