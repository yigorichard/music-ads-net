import { Link } from "wouter";
import { SiSpotify, SiYoutube, SiTiktok } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">MusicADS.net</h3>
            <p className="text-sm text-gray-600">
              Your one-stop solution for music promotion across major platforms.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Navigation</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Ana Sayfa</Link>
              <Link href="/packages" className="text-sm text-gray-600 hover:text-gray-900">Ad Paketleri</Link>
              <Link href="/news" className="text-sm text-gray-600 hover:text-gray-900">Müzik Haberleri</Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">İletişim</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Platformlar</h4>
            <div className="flex flex-col gap-2">
              <Link href="/platforms/spotify" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1DB954] transition-colors">
                <SiSpotify className="text-[#1DB954]" /> Spotify Promosyon
              </Link>
              <Link href="/platforms/youtube" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#FF0000] transition-colors">
                <SiYoutube className="text-[#FF0000]" /> YouTube Promosyon
              </Link>
              <Link href="/platforms/tiktok" className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors">
                <SiTiktok /> TikTok Promosyon
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">İletişim</h4>
            <p className="text-sm text-gray-600">
              Have questions? Get in touch with our team for personalized assistance.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          © {new Date().getFullYear()} MusicADS.net. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;