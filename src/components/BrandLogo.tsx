import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  className?: string;
};

export default function BrandLogo({ size = 80, className }: BrandLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="ধারাবাহিকতা ড্যাশবোর্ড"
      width={size}
      height={size}
      fetchPriority="high"
      className={cn("rounded-xl", className)}
    />
  );
}
