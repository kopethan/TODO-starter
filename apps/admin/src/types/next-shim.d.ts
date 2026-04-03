declare module "next" {
  export type Metadata = Record<string, unknown>;
}

declare module "next/link" {
  import type { ComponentPropsWithoutRef, ReactElement } from "react";

  export type LinkProps = ComponentPropsWithoutRef<"a"> & {
    href: string;
  };

  export default function Link(props: LinkProps): ReactElement;
}

declare module "next/navigation" {
  export function redirect(path: string): never;
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
  };
  export function useParams<T extends Record<string, string>>(): T;
  export function usePathname(): string;
  export function useSearchParams(): {
    get: (name: string) => string | null;
    toString: () => string;
  };
}
