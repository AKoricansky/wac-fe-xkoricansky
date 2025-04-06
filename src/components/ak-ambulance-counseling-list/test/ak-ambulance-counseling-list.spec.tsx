import { newSpecPage } from '@stencil/core/testing';
import { AkAmbulanceCounselingList } from '../ak-ambulance-counseling-list';

describe('ak-ambulance-counseling-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AkAmbulanceCounselingList],
      html: `<ak-ambulance-counseling-list></ak-ambulance-counseling-list>`,
    });
    expect(page.root).toEqualHtml(`
      <ak-ambulance-counseling-list>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ak-ambulance-counseling-list>
    `);
  });
});
