// Original Figma SVGs, embedded by Vite without changing their geometry.
// Small icons avoid separate requests competing with the initial hero.
import home from '/assets/figma/b096d.svg?raw'
import favorite from '/assets/figma/c40be.svg?raw'
import profile from '/assets/figma/99dca.svg?raw'
import cart from '/assets/figma/352b3.svg?raw'
import search from '/assets/figma/ce4db.svg?raw'
import filter from '/assets/figma/bc3bf.svg?raw'
import scanLine from '/assets/figma/d5458.svg?raw'
import scanTopLeft from '/assets/figma/ca931.svg?raw'
import scanTopRight from '/assets/figma/97351.svg?raw'
import scanBottomRight from '/assets/figma/db42b.svg?raw'
import scanBottomLeft from '/assets/figma/f7581.svg?raw'

const image = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`
export const mobileIcons = {
  home:image(home), favorite:image(favorite), profile:image(profile), cart:image(cart),
  search:image(search), filter:image(filter), scanLine:image(scanLine),
  scanTopLeft:image(scanTopLeft), scanTopRight:image(scanTopRight),
  scanBottomRight:image(scanBottomRight), scanBottomLeft:image(scanBottomLeft),
}
