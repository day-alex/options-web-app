interface ServerResponse {
    success: boolean;
    message: string;
    data ?: any;
}

interface OutputBoxProps {
    response: ServerResponse | null;
}

const OutputBox: React.FC<OutputBoxProps> = ({ response }) => {
    if (!response) return null;

    return (
        <div className="mt-8 p-4 bg-black border rounded max-w-md">
            <h2 className="text-xl font-bold mb-2">Server Response</h2>
            
            {response.success ? (
                <div>
                    <p className="font-semibold">Call Price: {response.data.results.callPrice}</p>
                    <p className="font-semibold">Put Price: {response.data.results.putPrice}</p>
                    
                    {/* Display any additional data from the server */}
                    {response.data.input && (
                        <div className="mt-2">
                        <h3 className="font-medium">Submitted Data:</h3>
                        <pre className="bg-black border-4 border-white-500 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(response.data.input, null, 2)}
                        </pre>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-red-600">
                    <p className="font-semibold">Error: {response.message}</p>
                </div>
            )}
            <p className="text-gray-500 text-sm mt-4">
                Response received at: {new Date().toLocaleTimeString()}
            </p>
        </div>
    );
}

export default OutputBox;
