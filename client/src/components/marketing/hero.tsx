import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const Hero = () => {
  return (
    <div className="relative">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Müziğinizi Dünyaya Duyurun
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Spotify, YouTube ve TikTok için profesyonel reklam paketleriyle 
            müziğinizi milyonlarca dinleyiciye ulaştırın. Sosyal medya 
            platformlarında organik büyüme ve gerçek dinleyici kitlesi oluşturun.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                Hemen Başlayın
              </Button>
            </Link>
            <Link href="/packages">
              <Button variant="outline" size="lg">Paketleri İnceleyin</Button>
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">10M+</div>
              <div className="text-sm text-gray-600">Toplam Dinleyici</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-gray-600">Başarılı Kampanya</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">98%</div>
              <div className="text-sm text-gray-600">Müşteri Memnuniyeti</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;