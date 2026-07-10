import React, { useState, useEffect } from 'react';
import { formatDate, daysUntilToday } from '@/utils/helpers';
import axios from 'axios';
import {
  InputNumber,
  Button,
  Form,
  SelectPicker,
  Message,
  AutoComplete
} from 'rsuite';

interface OptionsInputFormData {
  spot: number;
  strike: string;
  exp: string;
  rate: string;
  vol: string;
}

interface OptionsInputFormProps {
  onSubmitSuccess: (data: any) => void;
}

interface TickerOption {
  symbol: string;
  name: string;
}

const OptionsInputForm: React.FC<OptionsInputFormProps> = ({ onSubmitSuccess }) => {
  const [ticker, setTicker] = useState('');
  const [tickerInputValue, setTickerInputValue] = useState('');
  const [formValue, setFormValue] = useState<OptionsInputFormData>({
    spot: 0,
    strike: '',
    exp: '',
    rate: '0.045',
    vol: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  // Ticker autocomplete state
  const [allTickers, setAllTickers] = useState<{ label: string; value: string }[]>([]);
  const [isLoadingTickers, setIsLoadingTickers] = useState(false);

  const [optionExpirations, setOptionExpirations] = useState<string[]>([]);
  const [optionStrikes, setOptionStrikes] = useState<string[]>([]);
  const [callValue, setCallValue] = useState<number | null>(null);
  const [putValue, setPutValue] = useState<number | null>(null);
  const [strikeMap, setStrikeMap] = useState<{ [strike: string]: number }>({});
  const [putMap, setPutMap] = useState<{ [strike: string]: number }>({});

  // Load all S&P 500 tickers on component mount
  useEffect(() => {
    const loadAllTickers = async () => {
      setIsLoadingTickers(true);
      try {
        const response = await axios.get('http://localhost:8000/tickers/all');
        const tickerOptions = response.data.tickers.map((ticker: TickerOption) => ({
          label: `${ticker.symbol} - ${ticker.name}`,
          value: ticker.symbol
        }));
        setAllTickers(tickerOptions);
      } catch (error) {
        console.error('Error loading tickers:', error);
      } finally {
        setIsLoadingTickers(false);
      }
    };

    loadAllTickers();
  }, []);

  const getTickerExpirations = async (selectedTicker?: string) => {
    const tickerToUse = selectedTicker || ticker;
    if (!tickerToUse.trim()) return;

    try {
      const { data } = await axios.get('http://localhost:8000/options/expirations', {
        params: { ticker: tickerToUse }
      });
      if (Array.isArray(data.expirations)) {
        setOptionExpirations(data.expirations);
      }
    } catch (err) {
      console.error('Error fetching expirations:', err);
    }
  };

  const getTickerStrikes = async (expiration: string) => {
    try {
      const { data } = await axios.get('http://localhost:8000/options/lasts', {
        params: { ticker, expiration }
      });
      const strikeMap = data.calls[expiration] || {};
      const putMap = data.puts[expiration] || {};
      setOptionStrikes(Object.keys(strikeMap));
      setStrikeMap(strikeMap);
      setPutMap(putMap);
    } catch (err) {
      console.error('Error fetching strikes:', err);
    }
  };

  const handleTickerSelect = async (value: string) => {
    setTicker(value);
    // Auto-fetch expirations when ticker is selected
    const { data } = await axios.get('http://localhost:8000/ticker/price', {
      params: { ticker: value }
    });
    setFormValue({spot: data.last_price, strike: '', exp: '', rate: '0.045', vol: ''})
    getTickerExpirations(value);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formValue,
        exp: daysUntilToday(formValue.exp).toString()
      };
      const { data } = await axios.post('http://localhost:8000/options/calculate', payload);

      setStatus('success');
      setFormValue({ spot: 0, strike: '', exp: '', rate: '0.045', vol: '' });
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
        selectedPutValue: putValue
      });
    } catch (err) {
      console.error('Submit error:', err);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTickerKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      const ticker = tickerInputValue.trim().toUpperCase();
      if (ticker) {
        handleTickerSelect(ticker);
      }
    }
  };


  return (
    <Form
      fluid
      formValue={formValue}
      onChange={(val) => setFormValue(val as OptionsInputFormData)}
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-surface p-5"
    >
      {status === 'error' && (
        <Message type="error" showIcon className="!mb-4">
          Failed to submit. Please try again.
        </Message>
      )}

      {/* Ticker autocomplete */}
      <Form.Group>
        <Form.ControlLabel>Ticker Symbol</Form.ControlLabel>
        <AutoComplete
          data={allTickers}
          value={tickerInputValue}
          onChange={setTickerInputValue}
          onSelect={(val) => {
            setTicker(val);
            setTickerInputValue(val); // sync input text after selection
            handleTickerSelect(val);
          }}
          onKeyDown={handleTickerKeyDown}
          selectOnEnter
          placeholder={isLoadingTickers ? "Loading tickers..." : "Search S&P 500 tickers..."}
          disabled={isLoadingTickers}
          filterBy={(value, item) =>
            String(item.value).toLowerCase().includes(value.toLowerCase()) ||
            String(item.label).toLowerCase().includes(value.toLowerCase())
          }
          style={{ width: '100%' }}
        />

        <Form.HelpText>
          {isLoadingTickers 
            ? "Loading S&P 500 tickers..." 
            : "Search by ticker symbol or company name"
          }
        </Form.HelpText>
      </Form.Group>

      {/* Spot price */}
      <Form.Group controlId="spot">
        <Form.ControlLabel>Spot Price</Form.ControlLabel>
        <Form.Control
          name="spot"
          accepter={InputNumber}
          step={0.05}
          disabled={optionExpirations.length === 0}
        />
      </Form.Group>

      {/* Expiration */}
      <Form.Group controlId="exp">
        <Form.ControlLabel>Expiration</Form.ControlLabel>
        <Form.Control
          name="exp"
          accepter={SelectPicker}
          searchable={false}
          data={optionExpirations.map(exp => ({
            label: `${formatDate(exp)} | ${Math.round(
              daysUntilToday(exp) * 365
            )}d`,
            value: exp
          }))}
          onChange={val => {
            if (val) getTickerStrikes(val);
          }}
          disabled={optionExpirations.length === 0}
          style={{ width: '100%' }}
        />
      </Form.Group>

      {/* Strike */}
      <Form.Group controlId="strike">
        <Form.ControlLabel>Strike Price</Form.ControlLabel>
        <Form.Control
          name="strike"
          accepter={SelectPicker}
          searchable={false}
          data={optionStrikes.map(s => ({ label: s, value: s }))}
          onChange={val => {
            if (val) {
              setCallValue(strikeMap[val] || null);
              setPutValue(putMap[val] || null);
            }
          }}
          disabled={optionStrikes.length === 0}
          style={{ width: '100%' }}
        />
      </Form.Group>

      {/* Rate */}
      <Form.Group controlId="rate">
        <Form.ControlLabel>Risk-free Interest Rate</Form.ControlLabel>
        <Form.Control name="rate" />
      </Form.Group>

      {/* Vol */}
      <Form.Group controlId="vol">
        <Form.ControlLabel>Volatility</Form.ControlLabel>
        <Form.Control name="vol" />
      </Form.Group>

      <Button
        appearance="primary"
        type="submit"
        block
        className="!mt-2"
        loading={isSubmitting}
        disabled={
          !ticker ||
          !formValue.spot ||
          !formValue.exp ||
          !formValue.strike ||
          !formValue.rate ||
          !formValue.vol
        }
      >
        Submit
      </Button>
    </Form>
  );
};

export default OptionsInputForm;
