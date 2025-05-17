import { useState } from 'react';

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
  const [formData, setFormData] = useState<OptionsInputFormData>({
    spot: '',
    strike: '',
    exp: '',
    rate: '',
    vol: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Replace with your Express endpoint URL
      const response = await fetch('http://localhost:3001/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ spot: '', strike: '', exp: '', rate: '', vol: '' });
        onSubmitSuccess(data);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      {status === 'success' && <p className="text-green-600 mb-4">Form submitted successfully!</p>}
      {status === 'error' && <p className="text-red-600 mb-4">Failed to submit form. Please try again.</p>}
      
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
        <label htmlFor="strike" className="block mb-1">Strike Price</label>
        <input
          type="text"
          id="strike"
          name="strike"
          value={formData.strike}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="exp" className="block mb-1">Time to Expiration</label>
        <input
          type="text"
          id="exp"
          name="exp"
          value={formData.exp}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
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
