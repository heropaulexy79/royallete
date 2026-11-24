export default function MenuLoading() {
  return (
    <main className="min-h-screen bg-[#faf6f0] pb-28 sm:pb-16 flex flex-col">
      {/* Top Navbar Placeholder */}
      <div className="h-24 bg-[#191514]/10 animate-pulse border-b border-[#ede5da]" />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 w-full flex-1">
        {/* Search & Category Pills Skeleton */}
        <div className="h-12 w-full max-w-md bg-white rounded-2xl border border-[#ede5da] animate-pulse mb-5" />
        <div className="flex gap-2 overflow-hidden mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-[#ede5da] animate-pulse flex-shrink-0" />
          ))}
        </div>

        {/* Menu Cards Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl sm:rounded-3xl border border-[#ede5da] overflow-hidden p-3.5 sm:p-5 space-y-3"
            >
              <div className="h-36 sm:h-44 -mx-3.5 sm:-mx-5 -mt-3.5 sm:-mt-5 bg-[#ede5da]/80 animate-pulse" />
              <div className="h-4 w-3/4 bg-[#ede5da] rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-[#ede5da]/70 rounded animate-pulse" />
              <div className="h-10 w-full bg-[#ede5da] rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
