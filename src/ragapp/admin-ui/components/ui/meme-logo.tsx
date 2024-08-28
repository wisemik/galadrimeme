import { GlobeAltIcon, CubeIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/components/ui/fonts';
import { Inter } from "next/font/google";
import Image from 'next/image';

const inter = Inter({ subsets: ["latin"] });

export default function MemeLogo() {
  return (
    <div className={`${inter.className} flex flex-row items-center leading-none text-white`}>
      <CubeIcon className="h-12 w-12 rotate-[15deg]"/>
      <p className="text-[44px]">Meme</p>
    </div>
  );
}
