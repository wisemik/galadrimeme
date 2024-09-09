import { useCallback } from "react";
import { AccountType } from "@/pages";
import Link from "next/link";

interface HeaderProps extends AccountType {}

export const Header = ({ address, balance, chainId, network }: HeaderProps) => {
  return (
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight mb-1 mt-5 flex items-center">
        <Link href="/" className="hover:underline">
          Galadrimeme
        </Link>
        .
      </h2>
  );
};
