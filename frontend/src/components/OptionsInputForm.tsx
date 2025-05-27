import React, { useState } from 'react';

interface OptionsInputFormData {
  spot: string;
  strike: string;
  exp: string;
  rate: string;
  vol: string;
}

interface OptionsInputFormProps {
  onSubmitSuccess: (data: any) => void;
}

const OptionsInputForm: React.FC<OptionsInputFormProps> = ({ onSubmitSuccess }) => {
  const [ticker, setTicker] = useState<string>('');
  const [formData, setFormData] = useState<OptionsInputFormData>({
    spot: '',
    strike: '',
    exp: '',
    rate: '0.045',
    vol: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [optionExpirations, setOptionExpirations] = useState<string[]>([]);
  const [optionStrikes, setOptionStrikes] = useState<string[]>([]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'exp') {
      getTickerStrikes(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const grpcResponse = await fetch('http://localhost:3001/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const grpcData = await grpcResponse.json();

      if (grpcResponse.ok) {
        setStatus('success');
        setFormData({ spot: '', strike: '', exp: '', rate: '', vol: '' });
        onSubmitSuccess({...grpcData, ticker });
        setTicker('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTickerExpirations = async () => {
    try {
      const params = new URLSearchParams({ ticker });

      const response = await fetch(`http://localhost:3001/api/options/ticker?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const responseData = await response.json();

      if (Array.isArray(responseData.data.expirationDates)) {
        setOptionExpirations(responseData.data.expirationDates);
      }

    } catch (error) {
      console.error('Error fetching ticker data:', error);
    }
  };

  const getTickerStrikes = async (expiration: string) => {
    try {
      const params = new URLSearchParams({ ticker, expiration });

      const response = await fetch(`http://localhost:3001/api/options/ticker?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const responseData = await response.json();
      setOptionStrikes(responseData.data.strikes);

    } catch (error) {
      console.error('Error fetching ticker data:', error);
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      {status === 'success' && <p className="text-green-600 mb-4">Form submitted successfully!</p>}
      {status === 'error' && <p className="text-red-600 mb-4">Failed to submit form. Please try again.</p>}
      <div className="mb-4">
        <label htmlFor="tick" className="block mb-1">Ticker</label>
        <input
          type="text"
          id="tick"
          name="tick"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <button className='bg-blue-500 text-white py-2 px-4 rounded mb-2' type='button' onClick={getTickerExpirations}>
        Load Ticker Data
      </button>

      <div className="mb-4">
        <label htmlFor="spot" className="block mb-1">Spot Price</label>
        <input
          type="text"
          id="spot"
          name="spot"
          value={formData.spot}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
    
      <div className="mb-4">
        <label htmlFor="exp" className="block mb-1">Expiration</label>
        <select
          id="exp"
          name="exp"
          value={formData.exp}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          disabled={optionExpirations.length === 0}
        >
          <option value="">Select an expiration</option>
          {optionExpirations?.map((exp: string) => (
            <option key={exp} value={exp}>
              {exp}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="strike" className="block mb-1">Strike Price</label>
        <select
          id="strike"
          name="strike"
          value={formData.strike}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          disabled={!optionStrikes || optionStrikes.length === 0}
        >
          <option value="">Select a strike</option>
          {optionStrikes?.map((strike: string) => (
            <option key={strike} value={strike}>
              {strike}
            </option>
          ))}
        </select>
      </div>
      
      
      <div className="mb-4">
        <label htmlFor="rate" className="block mb-1">Risk-free Interest Rate</label>
        <input
          type="text"
          id="rate"
          name="rate"
          value={formData.rate}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="vol" className="block mb-1">Vol</label>
        <input
          type='text'
          id="vol"
          name="vol"
          value={formData.vol}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      
      <button 
        type="submit" 
        className="bg-blue-500 text-white py-2 px-4 rounded"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default OptionsInputForm;
