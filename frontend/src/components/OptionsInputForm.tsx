import React, { useState } from 'react';
import { formatDate, daysUntilToday } from '@/utils/helpers';
import axios from 'axios';
import { Input, InputGroup, Button } from 'rsuite';
import SearchIcon from '@rsuite/icons/Search'

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
  const [callValue, setCallValue] = useState<number | null>(null);
  const [putValue, setPutValue] = useState<number | null>(null);
  const [strikeMap, setStrikeMap] = useState<{ [strike: string]: number }>({});
  const [putMap, setPutMap] = useState<{ [strike: string]: number }>({});


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'exp') {
      getTickerStrikes(value);
    }

    if (name === 'strike') {
      setCallValue(strikeMap[value] || null);
      setPutValue(putMap[value] || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log(formData);
    e.preventDefault();
    setIsSubmitting(true);
    
    formData.exp = daysUntilToday(formData.exp).toString();
    try {
      const { data } = await axios.post('http://localhost:8000/options/calculate', formData);

      setStatus('success');
      setFormData({ spot: '', strike: '', exp: '', rate: '', vol: '' });
      setTicker('');
      setOptionExpirations([]);
      setOptionStrikes([]);
      setCallValue(null);
      setPutValue(null);
      setStrikeMap({});
      setPutMap({});

      onSubmitSuccess({
        ...data,
        ticker,
        selectedCallValue: callValue,
        selectedPutValue: putValue,
      });

    } catch (error) {
      console.error('Submit error:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTickerExpirations = async () => {
    try {
      const { data } = await axios.get('http://localhost:8000/options/expirations', {
        params: { ticker },
      });

      if (Array.isArray(data.expirations)) {
        setOptionExpirations(data.expirations);
      }
    } catch (error) {
      console.error('Error fetching ticker data:', error);
    }
  };

  const getTickerStrikes = async (expiration: string) => {
    try {
      const { data } = await axios.get('http://localhost:8000/options/lasts', {
        params: { ticker, expiration },
      });

      const strikeMap = data.calls[expiration] || {};
      const putMap = data.puts[expiration] || {};

      setOptionStrikes(Object.keys(strikeMap));
      setStrikeMap(strikeMap);
      setPutMap(putMap);
    } catch (error) {
      console.error('Error fetching strike data:', error);
    }
  };

  const formIsValid =
    ticker.trim() !== '' &&
    formData.spot.trim() !== '' &&
    formData.strike.trim() !== '' &&
    formData.exp.trim() !== '' &&
    formData.rate.trim() !== '' &&
    formData.vol.trim() !== '';

  return (
    <form onSubmit={handleSubmit} className="max-w-md p-3 mt-2">
      {status === 'error' && <p className="text-red-600 mb-4">Failed to submit. Please try again.</p>}

      <div className="mb-4">
        <InputGroup inside>
          <Input
            className='!bg-black !rounded-r-none !text-white'
            placeholder="Enter a ticker"
            value={ticker}
            onChange={(value) => setTicker(value)}
            required
          />
          <InputGroup.Button 
            onClick={getTickerExpirations}
            className={`${ticker.trim() ? '!bg-blue-400 !text-white' : '!bg-gray-600 text-gray-500 cursor-not-allowed'}`}
            disabled={!ticker.trim()}
          >
            <SearchIcon />
          </InputGroup.Button>
        </InputGroup>
        <div className='flex justify-center text-xs text-gray-500'>Search ticker to fetch expirations</div>
      </div>

      <div className="mb-4">
        <label htmlFor="spot" className="block mb-1">Spot Price</label>
        <input
          type="text"
          id="spot"
          name="spot"
          value={formData.spot}
          onChange={handleChange}
          className="w-full border p-2 rounded bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={optionExpirations.length === 0}
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
          className="w-full border p-2 rounded bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={optionExpirations.length === 0}
          required
        >
          <option value="" className="text-black">Select an expiration</option>
          {optionExpirations.map((exp) => (
            <option className="text-black" key={exp} value={exp}>
              {formatDate(exp)}
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
          className="w-full border p-2 rounded bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={optionStrikes.length === 0}
          required
        >
          <option value="" className="text-black">Select a strike</option>
          {optionStrikes.map((strike) => (
            <option className="text-black" key={strike} value={strike}>
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
          type="text"
          id="vol"
          name="vol"
          value={formData.vol}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <Button block
        type="submit"
        className="!bg-green-500 !text-black py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!formIsValid || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
};

export default OptionsInputForm;
