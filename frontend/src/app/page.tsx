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
    <div className="container mx-auto p-4">
      <h3 className="text-2xl font-bold !mb-3 text-center border-b-2 border-green-500">Black Scholes Pricer</h3>
      <div className="md:flex md:gap-8">
        <div className="md:w-1/2 flex justify-center">
          <div className="w-full max-w-md">
            <h5 className="text-xl mb-4">Enter option parameters</h5>
            <OptionsInputForm onSubmitSuccess={handleFormSubmitSuccess} />
          </div>
        </div>
        
        <div className="md:w-1/2 mt-8 md:mt-0">
          <h5 className="text-xl mb-4 border-b-4 border-indigo-500">Server Responses</h5>
          <div className="w-full space-y-4">
            {serverResponses.map((response, index) => (
              <OutputBox key={index} response={response}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
