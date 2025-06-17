import { newE2EPage } from '@stencil/core/testing';

describe('ak-ambulance-counseling-wl-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ak-ambulance-counseling-wl-editor></ak-ambulance-counseling-wl-editor>');

    const element = await page.find('ak-ambulance-counseling-wl-editor');
    expect(element).toHaveClass('hydrated');
  });
});
