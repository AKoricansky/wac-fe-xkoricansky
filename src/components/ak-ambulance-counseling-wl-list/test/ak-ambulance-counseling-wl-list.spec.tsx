import { newSpecPage } from '@stencil/core/testing';
import { AkAmbulanceCounselingWlList } from '../ak-ambulance-counseling-wl-list';

describe('ak-ambulance-counseling-wl-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AkAmbulanceCounselingWlList],
      html: `<ak-ambulance-counseling-wl-list></ak-ambulance-counseling-wl-list>`,
    });
    expect(page.root).toEqualHtml(`
      <ak-ambulance-counseling-wl-list>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ak-ambulance-counseling-wl-list>
    `);
  });
});
