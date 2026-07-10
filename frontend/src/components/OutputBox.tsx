'use client';
import React, { useState } from 'react';
import { Modal, Button } from 'rsuite';
import PathsChart from './PathsChart';

interface ServerResponse {
    success: boolean;
    message: string;
    data ?: any;
    ticker: string;
    pricingMethod?: 'bs' | 'mc';
    selectedCallValue?: number | null;
    selectedPutValue?: number | null;
}

interface OutputBoxProps {
    response: ServerResponse | null;
}

const OutputBox: React.FC<OutputBoxProps> = ({ response }) => {
    const [showPathsModal, setShowPathsModal] = useState(false);

    if (!response) return null;

    const isMC = response.pricingMethod === 'mc';
    const methodLabel = isMC ? 'Monte Carlo' : 'Black-Scholes';
    const hasPaths = isMC && response.data?.results?.paths?.length > 0;

    return (
        <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-row items-baseline gap-2 mb-3 pb-3 border-b border-border">
                <h4 className="font-semibold">{response.ticker}</h4>
                <p className="text-muted text-xs">
                    {methodLabel} &middot; {new Date().toLocaleTimeString()}
                </p>
            </div>
            {response.success ? (
                <>
                    <div className="flex flex-row border border-border divide-x divide-border rounded-md overflow-hidden">
                        <div className="w-1/3 p-4">
                            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted !mb-2">Parameters</h5>
                            <ul className="text-sm space-y-1">
                                <li>Spot Price: {response.data.input.spot}</li>
                                <li>Strike Price: {response.data.input.strike}</li>
                                <li>Exp (days): {response.data.input.exp * 365}</li>
                                <li>Risk Free Rate: {response.data.input.rate}</li>
                                <li>Volatility: {response.data.input.vol}</li>
                                {isMC && (
                                    <li>Paths: {response.data.results.numPaths?.toLocaleString()}</li>
                                )}
                            </ul>
                        </div>
                        <div className="w-1/3 p-4 bg-surface-alt text-center">
                            <h5 className="text-xs font-semibold uppercase tracking-wider text-call !mb-2">Call</h5>
                            <p id="callPrice">{isMC ? 'MC' : 'BS'}: {response.data.results.callPrice.toFixed(4)}</p>
                            {isMC && response.data.results.callStdError != null && (
                                <p className="text-xs text-muted mt-1">
                                    +/- {response.data.results.callStdError.toFixed(4)}
                                </p>
                            )}
                            <p className="text-sm text-muted mt-1">
                                YF: {response.selectedCallValue != null ? response.selectedCallValue.toFixed(2) : 'n/a'}
                            </p>
                        </div>
                        <div className="w-1/3 p-4 bg-surface-alt text-center">
                            <h5 className="text-xs font-semibold uppercase tracking-wider text-put !mb-2">Put</h5>
                            <p id="putPrice">{isMC ? 'MC' : 'BS'}: {response.data.results.putPrice.toFixed(4)}</p>
                            {isMC && response.data.results.putStdError != null && (
                                <p className="text-xs text-muted mt-1">
                                    +/- {response.data.results.putStdError.toFixed(4)}
                                </p>
                            )}
                            <p className="text-sm text-muted mt-1">
                                YF: {response.selectedPutValue != null ? response.selectedPutValue.toFixed(2) : 'n/a'}
                            </p>
                        </div>
                    </div>
                    {hasPaths && (
                        <>
                            <div className="mt-3 text-center">
                                <Button
                                    appearance="ghost"
                                    size="sm"
                                    onClick={() => setShowPathsModal(true)}
                                >
                                    View Simulated Paths ({response.data.results.numVisualPaths})
                                </Button>
                            </div>
                            <Modal
                                size="lg"
                                open={showPathsModal}
                                onClose={() => setShowPathsModal(false)}
                            >
                                <Modal.Header>
                                    <Modal.Title>
                                        Monte Carlo Simulated Paths — {response.ticker}
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <PathsChart
                                        paths={response.data.results.paths}
                                        numSteps={response.data.results.numSteps}
                                        spot={response.data.input.spot}
                                        strike={parseFloat(response.data.input.strike)}
                                    />
                                </Modal.Body>
                            </Modal>
                        </>
                    )}
                </>
            ) : (
                <div className="text-put text-sm">
                    <p className="font-semibold">Error: {response.message}</p>
                </div>
            )}
        </div>
    );
};


export default OutputBox;
