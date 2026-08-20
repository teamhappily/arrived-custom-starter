import Image from "next/image";

type FooterProps = {
  baseTextColor: string;
};

export function Footer({ baseTextColor }: FooterProps) {
  const isLightText = isLight(baseTextColor);
  const logo = isLightText
    ? "/powered-by-happily-arrived-light.svg"
    : "/powered-by-happily-arrived-dark.svg";

  return (
    <footer className="z-10 mt-auto px-2 py-8">
      <div className="flex flex-col items-center justify-center gap-6">
        <a
          href="https://teamhappily.com/arrived?ref=starter-kit"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={logo}
            width={292}
            height={55}
            className="object-contain"
            alt="Powered by Happily Arrived"
            draggable={false}
          />
        </a>
      </div>
    </footer>
  );
}

function isLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
