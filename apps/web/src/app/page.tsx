import { PublicHomePage } from "./public-home-page";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  return (
    <PublicHomePage
      q={readFirst(params.q)}
      type={readFirst(params.type)}
    />
  );
}
