import { newSpecPage } from '@stencil/core/testing';
import { AkAmbulanceCounselingWlAuth } from '../ak-ambulance-counseling-wl-auth';

describe('ak-ambulance-counseling-wl-auth', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AkAmbulanceCounselingWlAuth],
      html: `<ak-ambulance-counseling-wl-auth></ak-ambulance-counseling-wl-auth>`,
    });
    expect(page.root).toEqualHtml(`
      <ak-ambulance-counseling-wl-auth>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ak-ambulance-counseling-wl-auth>
    `);
  });
});
