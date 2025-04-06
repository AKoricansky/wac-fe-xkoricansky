import { newE2EPage } from '@stencil/core/testing';

describe('ak-ambulance-counseling-list', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ak-ambulance-counseling-list></ak-ambulance-counseling-list>');

    const element = await page.find('ak-ambulance-counseling-list');
    expect(element).toHaveClass('hydrated');
  });
});
