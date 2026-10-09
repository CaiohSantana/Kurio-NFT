import { useRef, useState } from 'react'
import type { Nft } from './contracts'
import { CarouselIndicators } from './CarouselIndicators'
import { Link } from '@tanstack/react-router'
import { CatalogLink, useCatalogDestination } from './CatalogLink'
import { useUnavailable } from './MarketShell'
export function Hero({ featured }: { featured?: Nft[] }) {
  const search = useCatalogDestination(), [slide,setSlide] = useState(0), [animated,setAnimated] = useState(false)
  const gesture = useRef<{ x: number; y: number } | null>(null), swiped = useRef(false)
  const nft = featured?.[slide], mini = featured?.[(slide + 1) % 3]
  const first = slide === 0
  const selectSlide = (index: number) => { setAnimated(true); setSlide(index) }
  const heading = <><span className="desktop-title">SEJA DONO DO FUTURO<br />DA ARTE DIGITAL</span><span className="mobile-title">SEJA DONO DA<br />CULTURA DIGITAL</span></>
  const intro = <><span className="desktop-title">Descubra NFTs de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.</span><span className="mobile-title">Descubra NFTs selecionados de criadores do mundo todo.</span></>
  const content = first ? heading : <><span className="desktop-title">{nft?.name}<br />ARTE EM DESTAQUE</span><span className="mobile-title">{nft?.name.split(' #')[0]}<br />#{nft?.name.split(' #')[1]}</span></>
  return <section className="home-hero" aria-label="Destaques de NFTs" onPointerDown={event => {
    if (event.target instanceof Element && event.target.closest('button')) return
    gesture.current = { x:event.clientX, y:event.clientY }; swiped.current = false
  }} onPointerCancel={() => { gesture.current = null }} onPointerUp={event => {
    if (!gesture.current || !featured?.length) return
    const dx = event.clientX-gesture.current.x, dy = event.clientY-gesture.current.y
    gesture.current = null
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)*1.4) { swiped.current = true; selectSlide((slide + (dx < 0 ? 1 : 2)) % 3) }
  }} onClickCapture={event => { if (swiped.current && event.detail > 0 && event.target instanceof Element && event.target.closest('.hero-art a')) { event.preventDefault(); event.stopPropagation() } swiped.current = false }}>
    <div className="hero-copy"><p>Bem-vindo à Kurio</p><h1><span className="hero-sizing" aria-hidden="true">{heading}</span><span className="hero-slide-copy">{content}</span></h1><p className="hero-description"><span className="hero-sizing" aria-hidden="true">{intro}</span><span className="hero-slide-copy">{first ? intro : <>Colecione {nft?.name}.</>}</span></p>{nft ? <Link className="hero-cta" aria-label={`Explorar ${nft.name}`} to="/nfts/$nftId" state={{ catalogSearch:search }} search={{ edition:'fifty',quantity:1 }} params={{ nftId:nft.id }}>EXPLORAR <span className="mobile-title">→</span></Link> : <span className="hero-cta" aria-disabled="true">EXPLORAR <span className="mobile-title">→</span></span>}</div>
    <div className="hero-art">{nft ? <Link key={nft.id} className={animated ? 'hero-changing' : undefined} to="/nfts/$nftId" state={{ catalogSearch:search }} search={{ edition:'fifty',quantity:1 }} params={{ nftId:nft.id }}><img src={nft.image} srcSet={`${nft.image.replace('-900.webp','-450.webp')} 450w, ${nft.image} 900w`} sizes="(max-width:639px) 138px, 450px" alt={nft.name} width="450" height="450" fetchPriority={first ? 'high' : 'auto'} /></Link> : <div className="hero-art-placeholder" aria-hidden="true" />}{mini && <img className="hero-mini" src={mini.image.replace('-900.webp','-450.webp')} alt={mini.name} width="58" height="58" />}</div>
    {featured?.length === 3 && <CarouselIndicators className="hero-dots" label="Escolher destaque" labels={featured.map((item,index) => `Destaque ${index + 1}: ${item.name}`)} active={slide} onChange={selectSlide} />}
  </section>
}
export function HomeSections() {
  const unavailable = useUnavailable()
  const posts = [['9add2-900.webp', 'Como funciona a propriedade de NFTs', 'Aprenda a colecionar, negociar e verificar ativos digitais.'], ['8f387-900.webp', '10 artistas digitais para acompanhar', 'Conheça criadores que moldam a cultura digital.'], ['83794-900.webp', 'Raridade, atributos e procedência', 'Entenda raridade, procedência, direitos autorais e utilidade.'], ['b7cfc-900.webp', 'Como proteger sua carteira', 'Proteja sua carteira, seus NFTs e sua identidade.']]
  return <><section className="promos">{[['8f387-900.webp', 'Lançamentos gênesis de edição limitada', 'Colecione edições escassas diretamente dos criadores antes da revelação pública.'], ['9add2-900.webp', 'Arte digital selecionada e muito mais', 'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.']].map(([image, title, text]) => <article key={image}><img src={`/assets/optimized/${image}`} alt="" width="292" height="250" loading="lazy" /><div><h2>{title}</h2><p>{text}</p><CatalogLink>Explorar →</CatalogLink></div></article>)}</section><section className="blog"><h2>Diário da Cunhagem</h2><p>Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p><div className="blog-cards">{posts.map(([image, title, text], i) => <article key={image}><img src={`/assets/optimized/${image}`} alt="" width="268" height="195" loading="lazy" /><div><p>{12 + i} de setembro | Leitura de {i === 0 ? 6 : 2} min</p><h3>{title}</h3><p>{text}</p><button onClick={() => unavailable('Conteúdo editorial')}>Ler mais →</button></div></article>)}</div></section></>
}
