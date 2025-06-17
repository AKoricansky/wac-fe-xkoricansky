import { newSpecPage } from '@stencil/core/testing';
import { AkAmbulanceCounselingWlEditor } from '../ak-ambulance-counseling-wl-editor';

describe('ak-ambulance-counseling-wl-editor', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AkAmbulanceCounselingWlEditor],
      html: `<ak-ambulance-counseling-wl-editor></ak-ambulance-counseling-wl-editor>`,
    });
    expect(page.root).toEqualHtml(`
      <ak-ambulance-counseling-wl-editor>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ak-ambulance-counseling-wl-editor>
    `);
  });
});
