'use client'
import { useState } from "react";
import OptionsInputForm from "../components/OptionsInputForm";
import OutputBox from "../components/OutputBox";

interface ServerResponse {
    success: boolean;
    message: string;
    data ?: any;
    ticker: string;
    selectedCallValue?: number | null;
    selectedPutValue?: number | null;
}

export default function Home() {
  const[serverResponses, setServerResponses] = useState<ServerResponse[]>([]);

  const handleFormSubmitSuccess = (data: ServerResponse) => {
    setServerResponses((prevResponses) => [...prevResponses, data]);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-5">
          <h1 className="text-lg font-semibold tracking-tight">Black-Scholes Pricer</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-10 md:grid-cols-2">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
              Option Parameters
            </h2>
            <OptionsInputForm onSubmitSuccess={handleFormSubmitSuccess} />
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
              Results
            </h2>
            {serverResponses.length === 0 ? (
              <p className="text-sm text-muted border border-dashed border-border rounded-md p-6 text-center">
                Submit the form to see pricing results.
              </p>
            ) : (
              <div className="space-y-4">
                {serverResponses.map((response, index) => (
                  <OutputBox key={index} response={response} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
