import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border py-6 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Image
            src="/logo-dice.png"
            alt="DICE Consortium"
            width={180}
            height={60}
            className="object-contain"
          />
          <Image
            src="/logo-p2e.png"
            alt="P2E International"
            width={90}
            height={60}
            className="object-contain"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Developing Innovative Community Empowerment
        </p>
      </div>
    </footer>
  );
}
