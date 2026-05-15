import { HomeForm } from "../components/home-form";
import { useHome } from "../hooks/use-home";

export function HomePage() {
  const { isLoading, data } = useHome();
  return <HomeForm isLoading={isLoading} data={data} />;
}
