import MemeLogo from '@/components/ui/meme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/components/ui/fonts';
import Image from 'next/image';
import { Footer } from "@/sections/footer";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-pink-900 p-4 md:h-52">
        <MemeLogo />
      </div>
      <div className="lg:flex lg:justify-between">
        <div className="lg:w-1/2">Left Content</div>
        <div className="lg:w-1/2">Right Content</div>
      </div>
      <div className="w-full shrink-0">
        <Footer />
      </div>
    </main>
  );
}
