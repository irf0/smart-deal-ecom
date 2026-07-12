import SellForm from "@/components/strorefront/sell-form";

export default function SellPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sell Your Phone</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {
            "Tell us about your device and we'll get back to you with a quote on WhatsApp."
          }
        </p>
      </div>
      <SellForm />
    </div>
  );
}
