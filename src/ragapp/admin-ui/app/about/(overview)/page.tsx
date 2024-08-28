"use client";

import { Footer } from "@/sections/footer";
import { Knowledge } from "@/sections/knowledge";
import { StatusBar } from "@/sections/statusBar";

import Link from 'next/link';
import { lusitana } from '@/components/ui/fonts';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Page() {
  return (
      <main className="flex min-h-screen flex-col p-6">
            <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
              <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">

                <p className={`${lusitana.className} text-xl text-gray-800 md:text-3xl md:leading-normal`}>
                  <strong>Welcome to Meme.</strong> This is an AI tool for fair MemeCoins assessment.
                </p>
                <Link
                  href="/chat"
                  className="flex items-center gap-5 self-start rounded-lg bg-pink-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
                >
                  <span>Investigate MemeCoins</span> <ArrowRightIcon className="w-5 md:w-6" />
                </Link>
              </div>
            </div>
          </main>
  );
}
