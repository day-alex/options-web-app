'use client'
import { useState } from "react";
import OptionsInputForm from "../components/OptionsInputForm";
import OutputBox from "../components/OutputBox";

interface ServerResponse {
    success: boolean;
    message: string;
    data ?: any;
    ticker: string;
}

export default function Home() {
  const[serverResponses, setServerResponses] = useState<ServerResponse[]>([]);

  const handleFormSubmitSuccess = (data: ServerResponse) => {
    setServerResponses((prevResponses) => [...prevResponses, data]);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Black Scholes Pricer</h1>
      <div className="md:flex md:gap-8">
        <div className="md:w-1/2">
          <div className="w-full">
            <h2 className="text-xl mb-4">Enter option data:</h2>
            <OptionsInputForm onSubmitSuccess={handleFormSubmitSuccess} />
          </div>
        </div>
        
        <div className="md:w-1/2 mt-8 md:mt-0">
          <h2 className="text-xl mb-4 border-b-4 border-indigo-500">Server Responses</h2>
          <div className="w-full space-y-4">
            {serverResponses.map((response, index) => (
              <OutputBox key={index} response={response} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
