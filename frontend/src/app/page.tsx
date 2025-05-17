'use client'
import { useState } from "react";
import OptionsInputForm from "../components/OptionsInputForm";
import OutputBox from "../components/OutputBox";

interface ServerResponse {
    success: boolean;
    message: string;
    data ?: any;
}

export default function Home() {
  const[serverResponse, setServerResponse] = useState<ServerResponse | null>(null);

  const handleFormSubmitSuccess = (data: ServerResponse) => {
    setServerResponse(data);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Black Scholes Pricer</h1>
      
      <div className="md:flex md:gap-8">
        <div className="md:w-1/2">
          <h2 className="text-xl mb-4">Enter option data:</h2>
          <OptionsInputForm onSubmitSuccess={handleFormSubmitSuccess} />
        </div>
        
        <div className="md:w-1/2 mt-8 md:mt-0">
          <OutputBox response={serverResponse} />
        </div>
      </div>
    </div>
  );
}
