import { newSpecPage } from '@stencil/core/testing';
import { AkAmbulanceCounselingWlQuestion } from '../ak-ambulance-counseling-wl-question';

describe('ak-ambulance-counseling-wl-question', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AkAmbulanceCounselingWlQuestion],
      html: `<ak-ambulance-counseling-wl-question></ak-ambulance-counseling-wl-question>`,
    });
    expect(page.root).toEqualHtml(`
      <ak-ambulance-counseling-wl-question>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ak-ambulance-counseling-wl-question>
    `);
  });
});
