import Image from "next/image";

import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ProductSection } from "@/components/product-section";

function InstagramIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />

        <ProductSection />

        {/* Coleção */}
        <section
          id="colecao"
          className="bg-[#eeeae3] px-5 py-24 md:px-8 md:py-32 lg:px-12"
        >
          <div className="mx-auto grid max-w-[1600px] items-center gap-12 md:grid-cols-2 md:gap-20">
            <div>
              <p className="text-[9px] uppercase tracking-[0.5em] text-black/45">
                Saint Marin
              </p>

              <h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight tracking-wide md:text-6xl">
                Offline is the new luxury.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-black/55">
                Uma coleção criada para quem valoriza
                presença, autenticidade e liberdade.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/produtos"
                  className="inline-flex border border-black px-8 py-3.5 text-[9px] uppercase tracking-[0.35em] transition-all duration-300 hover:bg-black hover:text-white"
                >
                  Explorar coleção
                </a>

                <a
                  href="https://www.instagram.com/saintmarinbr_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-black/20 px-6 py-3.5 text-[9px] uppercase tracking-[0.3em] transition-all duration-300 hover:border-black"
                >
                  <InstagramIcon size={14} />
                  Instagram
                </a>
              </div>
            </div>

            <div className="relative aspect-[4/5] overflow-hidden bg-[#ddd8cf]">
              <Image
                src="/images/saint-marin-hero.png"
                alt="Saint Marin"
                fill
                className="object-cover object-center"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        id="sobre"
        className="bg-[#111111] px-5 py-16 text-white md:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-12 md:grid-cols-3">
            {/* Marca */}
            <div>
              <div className="font-serif text-3xl tracking-[0.15em]">
                SAINT MARIN
              </div>

              <p className="mt-3 text-[9px] uppercase tracking-[0.4em] text-white/35">
                Premium Clothing · Est. 2025
              </p>
            </div>

            {/* Navegação */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-white/35">
                Navegação
              </p>

              <nav className="mt-5 flex flex-col gap-3 text-[10px] uppercase tracking-[0.25em] text-white/70">
                <a
                  href="#masculino"
                  className="transition-colors hover:text-white"
                >
                  Masculino
                </a>

                <a
                  href="#colecao"
                  className="transition-colors hover:text-white"
                >
                  Coleção
                </a>

                <a
                  href="#sobre"
                  className="transition-colors hover:text-white"
                >
                  Saint Marin
                </a>
              </nav>
            </div>

            {/* Instagram */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-white/35">
                Siga a Saint Marin
              </p>

              <a
                href="https://www.instagram.com/saintmarinbr_/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-white"
              >
                <InstagramIcon size={17} />
                @saintmarinbr_
              </a>
            </div>
          </div>

          <div className="mt-16 border-t border-white/10 pt-6 text-[10px] text-white/35">
            © 2025 Saint Marin. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </>
  );
}