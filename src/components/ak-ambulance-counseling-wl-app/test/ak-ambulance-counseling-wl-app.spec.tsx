import { newSpecPage } from '@stencil/core/testing';
import { AkAmbulanceCounselingWlApp } from '../ak-ambulance-counseling-wl-app';

describe('ak-ambulance-counseling-wl-app', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AkAmbulanceCounselingWlApp],
      html: `<ak-ambulance-counseling-wl-app></ak-ambulance-counseling-wl-app>`,
    });
    expect(page.root).toEqualHtml(`
      <ak-ambulance-counseling-wl-app>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ak-ambulance-counseling-wl-app>
    `);
  });
});
