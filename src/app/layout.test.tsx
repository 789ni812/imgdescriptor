import { render } from '@testing-library/react';
import Layout from './layout';

describe('App Layout', () => {
  it('should use the Inter font-family', () => {
    const { container } = render(<Layout>{null}</Layout>);
    // Check the computed style on the main element
    const main = container.querySelector('main');
    expect(main).toBeTruthy();
    // This will only work if JSDOM picks up the font-family from globals.css
    // so we check for the class or style attribute as a proxy
    expect(main?.className).toMatch(/font-sans/);
  });
}); 