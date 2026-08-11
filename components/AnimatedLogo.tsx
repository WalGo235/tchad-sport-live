const LOGO_URL =
  "https://iqsrxyuazktyiyhpbzie.supabase.co/storage/v1/object/public/photos/1786046878776.png";

export default function AnimatedLogo() {
  return (
    <div className="flex justify-center py-10">
      <div className="relative w-56 h-56 sm:w-72 sm:h-72">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} alt="TchadSportLive" className="w-full h-full object-contain" />
        <svg
          viewBox="0 0 100 100"
          className="absolute left-1/2 top-1/2 w-[22%] h-[22%] animate-heartbeat"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <defs>
            <clipPath id="heartClip">
              <path d="M50 88 C15 65 5 40 22 22 C34 10 50 18 50 32 C50 18 66 10 78 22 C95 40 85 65 50 88 Z" />
            </clipPath>
          </defs>
          <g clipPath="url(#heartClip)">
            <rect x="0" y="0" width="33.4" height="100" fill="#002664" />
            <rect x="33.3" y="0" width="33.4" height="100" fill="#FECB00" />
            <rect x="66.6" y="0" width="33.4" height="100" fill="#C60C30" />
          </g>
        </svg>
      </div>
    </div>
  );
}