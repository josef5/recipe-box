import { Main } from "@/components/main";
import { BackButton } from "@/components/ui/back-button";

export default function NotFound() {
  return (
    <Main>
      <div className="space-y-4">
        <h1 className="font-bold">404 - Page Not Found</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist.</p>
        <BackButton type="button" variant="primary" fallbackHref="/">
          Back
        </BackButton>
      </div>
    </Main>
  );
}
