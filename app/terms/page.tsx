import { LegalPage } from "@/components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Terms" title="A clear agreement for using Solum.">
      <section><h2>Eligibility</h2><p>You must be at least 18 years old and able to enter a binding agreement to create an account.</p></section>
      <section><h2>What Solum is</h2><p>Solum provides AI-generated voice companions. Companions are not human and their responses may be incomplete, inaccurate, or inappropriate. Solum is not medical care, therapy, legal advice, financial advice, or an emergency service.</p></section>
      <section><h2>Acceptable use</h2><p>Do not use Solum to break the law, harass or impersonate people, exploit minors, generate dangerous instructions, attack the service, evade access controls, or upload information you do not have permission to share.</p></section>
      <section><h2>Your account and content</h2><p>You are responsible for your account credentials and the content you provide. You retain your rights in that content and grant Solum the limited permission needed to process it and provide the service.</p></section>
      <section><h2>Availability</h2><p>The service may change, experience interruptions, or be discontinued. Voice and telecommunications availability also depend on third-party providers and your network.</p></section>
      <section><h2>Suspension</h2><p>Access may be limited or suspended to protect users, providers, or the service; address abuse; or comply with law.</p></section>
    </LegalPage>
  );
}
