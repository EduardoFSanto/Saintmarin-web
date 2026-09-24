import Image from "next/image";

export function Hero() {
  return (
    <section className="bg-[#f7f5f0]">
      <div className="mx-auto max-w-[1800px] px-0 md:px-6 lg:px-10">
        <div className="relative overflow-hidden bg-[#e9e5dc]">
          <div className="relative aspect-[4/5] w-full md:aspect-[16/8]">
            <Image
              src="/images/saint-marin-hero.png"
              alt="Saint Marin — Premium Clothing"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />

            <div className="absolute inset-0 bg-black/5" />

            <div className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-10 text-center text-white md:pb-14">
              <div>
                <p className="text-[8px] uppercase tracking-[0.55em] md:text-[9px]">
                  Premium Clothing · Est. 2025
                </p>

                <h1 className="mt-3 font-serif text-4xl tracking-[0.12em] md:text-6xl lg:text-7xl">
                  SAINT MARIN
                </h1>

                <a
                  href="#masculino"
                  className="mt-6 inline-flex border border-white px-8 py-3.5 text-[9px] uppercase tracking-[0.35em] transition-all duration-300 hover:bg-white hover:text-black"
                >
                  Ver coleção
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}