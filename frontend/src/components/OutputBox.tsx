interface ServerResponse {
    success: boolean;
    message: string;
    data ?: any;
    ticker: string;
    selectedCallValue?: number | null;
    selectedPutValue?: number | null;
}

interface OutputBoxProps {
    response: ServerResponse | null;
}

const OutputBox: React.FC<OutputBoxProps> = ({ response }) => {
    if (!response) return null;

    return (
        <div className="mt-8 p-2 bg-black border border-gray-400 rounded">
            <div className="flex flex-row items-center gap-1 mb-2">
                <h2>{response.ticker}</h2>
                <p className="text-gray-400 text-xs">
                    @ {new Date().toLocaleTimeString()}
                </p>
            </div>
            {response.success ? (
                <div className="flex flex-row border border-white divide-x divide-white rounded overflow-hidden">
                    <div className="w-1/3 p-4">
                        <h2 className="text-indigo-500 font-semibold mb-2">Parameters</h2>
                        <ul className="text-sm text-white space-y-1">
                            <li>Spot Price: {response.data.input.spot}</li>
                            <li>Strike Price: {response.data.input.strike}</li>
                            <li>Exp (years): {response.data.input.exp}</li>
                            <li>Risk Free Rate: {response.data.input.rate}</li>
                            <li>Volatility: {response.data.input.vol}</li>
                        </ul>
                    </div>
                    <div className="w-1/3 p-2 text-white text-center">
                        <h2 className="text-green-400 font-semibold my-2">Call</h2>
                        <p id="callPrice" className="text-xl font-bold">{response.data.results.callPrice.toFixed(4)}</p>
                        <p className="text-sm text-green-300 mt-1">
                            YF: {response.selectedCallValue != null ? response.selectedCallValue.toFixed(2) : 'n/a'}
                        </p>
                    </div>
                    <div className="w-1/3 p-2 text-white text-center">
                        <h2 className="text-red-400 font-semibold my-2">Put</h2>
                        <p id="putPrice" className="text-xl font-bold">{response.data.results.putPrice.toFixed(4)}</p>
                        <p className="text-sm text-red-300 mt-1">
                            YF: {response.selectedPutValue != null ? response.selectedPutValue.toFixed(2) : 'n/a'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="text-red-600">
                    <p className="font-semibold">Error: {response.message}</p>
                </div>
            )}
        </div>
    );
};


export default OutputBox;
