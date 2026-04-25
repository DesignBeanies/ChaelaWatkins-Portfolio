import PortfolioPage from "@/components/PortfolioPage";

/**
 * Server entry for `/` — the page UI is a client component so Next can
 * pre-render the shell and stream the client bundle without putting the
 * whole app in the `app` route module (avoids a few RSC/CSR edge cases).
 */
export default function Page() {
  return <PortfolioPage />;
}
