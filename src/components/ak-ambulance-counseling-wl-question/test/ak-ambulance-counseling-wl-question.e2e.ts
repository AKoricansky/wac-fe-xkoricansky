import { newE2EPage } from '@stencil/core/testing';

describe('ak-ambulance-counseling-wl-question', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ak-ambulance-counseling-wl-question></ak-ambulance-counseling-wl-question>');

    const element = await page.find('ak-ambulance-counseling-wl-question');
    expect(element).toHaveClass('hydrated');
  });
});
