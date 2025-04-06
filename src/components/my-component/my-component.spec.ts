import { newSpecPage } from '@stencil/core/testing';
import { MyComponent } from './my-component';

describe('my-component', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [MyComponent],
      html: '<my-component></my-component>',
    });
    expect(root).toEqualHtml(`
      <my-component>
        <mock:shadow-root>
          <div>
            
          </div>
        </mock:shadow-root>
      </my-component>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [MyComponent],
      html: `<my-component first="Projekt xkoricansky - Odborné poradenstvo"></my-component>`,
    });
    expect(root).toEqualHtml(`
      <my-component first="Projekt xkoricansky - Odborné poradenstvo">
        <mock:shadow-root>
          <div>
            Projekt xkoricansky - Odborné poradenstvo
          </div>
        </mock:shadow-root>
      </my-component>
    `);
  });
});
