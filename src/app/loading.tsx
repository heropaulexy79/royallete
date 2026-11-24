export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-[#faf6f0] flex flex-col">
      {/* Top Navbar Placeholder */}
      <div className="h-24 bg-[#191514]/10 animate-pulse border-b border-[#ede5da]" />

      {/* Hero Skeleton */}
      <div className="w-full h-56 sm:h-96 bg-[#ede5da]/70 animate-pulse" />

      {/* Category Tiles Skeleton */}
      <section className="py-8 sm:py-14 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-32 sm:h-44 rounded-2xl sm:rounded-3xl bg-[#ede5da]/80 animate-pulse"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
