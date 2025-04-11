import React, { useState } from 'react';
import axios from 'axios';

const GigCreationForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    deliveryTime: 0,
    revisionCount: 0,
    tags: [],
    requirements: '',
    pricing: [
      { tier: 'Basic', price: '' },
      { tier: 'Standard', price: '' },
      { tier: 'Premium', price: '' }
    ],
    faqs: [{ question: '', answer: '' }],
    currentTag: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePricingChange = (index, e) => {
    const { name, value } = e.target;
    const newPricing = [...formData.pricing];
    newPricing[index][name] = value;
    setFormData({
      ...formData,
      pricing: newPricing
    });
  };

  const handleFaqChange = (index, e) => {
    const { name, value } = e.target;
    const newFaqs = [...formData.faqs];
    newFaqs[index][name] = value;
    setFormData({
      ...formData,
      faqs: newFaqs
    });
  };

  const addFaq = () => {
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { question: '', answer: '' }]
    });
  };

  const removeFaq = (index) => {
    const newFaqs = [...formData.faqs];
    newFaqs.splice(index, 1);
    setFormData({
      ...formData,
      faqs: newFaqs
    });
  };

  const handleTagChange = (e) => {
    setFormData({
      ...formData,
      currentTag: e.target.value
    });
  };

  const addTag = () => {
    if (formData.currentTag.trim() && !formData.tags.includes(formData.currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.currentTag.trim()],
        currentTag: ''
      });
    }
  };

  const removeTag = (index) => {
    const newTags = [...formData.tags];
    newTags.splice(index, 1);
    setFormData({
      ...formData,
      tags: newTags
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token'); // Assuming you store JWT token here
      const response = await axios.post('http://localhost:3000/api/v1/gig/', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        deliveryTime: parseInt(formData.deliveryTime),
        revisionCount: parseInt(formData.revisionCount),
        tags: formData.tags,
        requirements: formData.requirements,
        pricing: formData.pricing.filter(price => price.price),
        faqs: formData.faqs.filter(faq => faq.question && faq.answer)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccess(true);
      // Reset form or redirect as needed
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create gig');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create a New Gig</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          Gig created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="title">
              Gig Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="category">
              Category*
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              <option value="Web Development">Web Development</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Writing & Translation">Writing & Translation</option>
              <option value="Video & Animation">Video & Animation</option>
              <option value="Music & Audio">Music & Audio</option>
              <option value="Programming & Tech">Programming & Tech</option>
              <option value="Business">Business</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="description">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pricing Packages</h2>
          
          {formData.pricing.map((price, index) => (
            <div key={index} className="mb-4 p-4 border rounded-md">
              <h3 className="font-medium mb-2">{price.tier} Package</h3>
              <div className="flex items-center">
                <span className="mr-2">$</span>
                <input
                  type="number"
                  name="price"
                  value={price.price}
                  onChange={(e) => handlePricingChange(index, e)}
                  className="w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Delivery & Revisions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Delivery & Revisions</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="deliveryTime">
              Delivery Time (in days)*
            </label>
            <input
              type="number"
              id="deliveryTime"
              name="deliveryTime"
              value={formData.deliveryTime}
              onChange={handleChange}
              className="w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="revisionCount">
              Number of Revisions Included*
            </label>
            <input
              type="number"
              id="revisionCount"
              name="revisionCount"
              value={formData.revisionCount}
              onChange={handleChange}
              className="w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Tags</h2>
          
          <div className="mb-2">
            <div className="flex">
              <input
                type="text"
                value={formData.currentTag}
                onChange={handleTagChange}
                className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">Add tags that describe your gig (max 5 tags)</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                <span className="mr-1">{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Requirements</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="requirements">
              What do you need from buyers to get started?
            </label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Example: Please provide your logo files and brand colors"
            />
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          {formData.faqs.map((faq, index) => (
            <div key={index} className="mb-4 p-4 border rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">FAQ #{index + 1}</h3>
                {formData.faqs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Question</label>
                <input
                  type="text"
                  name="question"
                  value={faq.question}
                  onChange={(e) => handleFaqChange(index, e)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Answer</label>
                <textarea
                  name="answer"
                  value={faq.answer}
                  onChange={(e) => handleFaqChange(index, e)}
                  rows="2"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addFaq}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            + Add FAQ
          </button>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Gig...' : 'Create Gig'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GigCreationForm;