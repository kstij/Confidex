import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import api from '../utils/api';
import './FormSubmit.css';

const FormSubmit = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('name'); // 'name' or 'form'
  const [submitterName, setSubmitterName] = useState('');
  const [user, setUser] = useState(null);
  const [isDirectFormAccess, setIsDirectFormAccess] = useState(false);

  useEffect(() => {
    // Check if this is direct form access (not from dashboard)
    const isDirect = !document.referrer.includes(window.location.origin) || 
                    document.referrer === '' ||
                    window.location.pathname.includes('/form/');
    setIsDirectFormAccess(isDirect);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        // For direct form access, redirect to login with returnUrl
        if (isDirect) {
          navigate(`/login?returnUrl=/form/${formId}`);
        } else {
          navigate('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [navigate, formId]);

  const fetchForm = useCallback(async () => {
    try {
      const response = await api.get(`/form/${formId}`);
      setForm(response.data);
      
      // Initialize answers object
      const initialAnswers = {};
      response.data.questions.forEach(question => {
        if (question.type === 'checkbox') {
          initialAnswers[question.id] = [];
        } else {
          initialAnswers[question.id] = '';
        }
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Form fetch error:', error);
      const errMsg = error.response?.data?.error || 'Failed to load form';
      setError(errMsg);
      if (errMsg === 'Form is not active') {
        navigate('/form-closed');
      }
    } finally {
      setLoading(false);
    }
  }, [formId, navigate]);

  useEffect(() => {
    if (user) {
      fetchForm();
    }
  }, [user, fetchForm]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!submitterName.trim()) {
      setError('Please enter your name');
      return;
    }
    setStep('form');
    setError('');
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId, option, checked) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, option]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(ans => ans !== option)
        };
      }
    });
  };

  const validateForm = () => {
    for (const question of form.questions) {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          setError(`Question "${question.label}" is required`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post(`/form/${formId}/submit`, { 
        answers,
        submitterName: submitterName.trim()
      });
      navigate(`/thank-you/${formId}`);
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.response?.data?.error || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'short-answer':
        return (
          <input
            type="text"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            className="form-input"
          />
        );
      
      case 'long-answer':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            rows="4"
            className="form-textarea"
          />
        );
      
      case 'rating':
        const minRating = question.minRating || 1;
        const maxRating = question.maxRating || 5;
        return (
          <div className="rating-container">
            {Array.from({ length: maxRating - minRating + 1 }, (_, i) => minRating + i).map(rating => (
              <label key={rating} className="rating-option">
                <input
                  type="radio"
                  name={question.id}
                  value={rating}
                  checked={answers[question.id] === rating.toString()}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
                <span className="rating-label">{rating}</span>
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="checkbox-container">
            {question.options.map((option, index) => (
              <label key={index} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={(answers[question.id] || []).includes(option)}
                  onChange={(e) => handleCheckboxChange(question.id, option, e.target.checked)}
                />
                <span className="checkbox-label">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'dropdown':
        return (
          <select
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="form-select"
          >
            <option value="">Select an option</option>
            {question.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      default:
        return <p>Unsupported question type</p>;
    }
  };

  if (loading) {
    return (
      <div className={`form-submit ${isDirectFormAccess ? 'direct-access' : ''}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading form...</p>
        </div>
      </div>
    );
  }

  if (error && error.includes('Access denied')) {
    return (
      <div className={`form-submit ${isDirectFormAccess ? 'direct-access' : ''}`}>
        <div className="error-container">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this form.</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (error && error.includes('already submitted')) {
    return (
      <div className={`form-submit ${isDirectFormAccess ? 'direct-access' : ''}`}>
        <div className="error-container">
          <h2>Already Submitted</h2>
          <p>You have already submitted this form.</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Clean layout for direct form access
  if (isDirectFormAccess) {
    if (step === 'name') {
      return (
        <div className="form-submit direct-access">
          <div className="form-container">
            <div className="form-header">
              <h1>{form?.title}</h1>
              {form?.description && <p className="form-description">{form.description}</p>}
            </div>

            <div className="name-collection-step minimal">
              <h2 className="step-title"> Enter Your Name</h2>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              <form onSubmit={handleNameSubmit} className="name-form minimal">
                <div className="form-group">
                  <label htmlFor="submitterName" className="form-label required">Your Name</label>
                  <input
                    type="text"
                    id="submitterName"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="form-input minimal"
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-btn minimal"
                  >
                    Continue to Form
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="form-submit direct-access">
        <div className="form-container">
          <div className="form-header">
            <h1>{form.title}</h1>
            {form.description && <p className="form-description">{form.description}</p>}
            <div className="submitter-info">
              <p><strong>Submitting as:</strong> {submitterName}</p>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="feedback-form">
            {form.questions.map((question, index) => (
              <div key={question.id} className="question-card">
                <div className="question-header">
                  <h3 className="question-label">
                    {question.label} {question.required && <span className="required">*</span>}
                  </h3>
                </div>
                
                <div className="question-input">
                  {renderQuestion(question)}
                </div>
              </div>
            ))}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setStep('name')}
                className="back-btn"
                disabled={submitting}
              >
                Back
              </button>
              <button
                type="submit"
                className="submit-btn bw"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Regular layout for dashboard access
  if (step === 'name') {
    return (
      <div className="form-submit">
        <div className="form-container">
          <div className="form-header">
            <h1>{form?.title}</h1>
            {form?.description && <p className="form-description">{form.description}</p>}
          </div>

          <div className="name-collection-step minimal">
            <h2 className="step-title"> Enter Your Name</h2>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            <form onSubmit={handleNameSubmit} className="name-form minimal">
              <div className="form-group">
                <label htmlFor="submitterName" className="form-label required">Your Name</label>
                <input
                  type="text"
                  id="submitterName"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="form-input minimal"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                >
                  Continue to Form
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <h2 className="page-title">Submit Feedback</h2>
      <div className="page-content">
        <div className="form-submit">
          <div className="form-container">
            <div className="form-header">
              <h1>{form.title}</h1>
              {form.description && <p className="form-description">{form.description}</p>}
              <div className="submitter-info">
                <p><strong>Submitting as:</strong> {submitterName}</p>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="feedback-form">
              {form.questions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <h3 className="question-label">
                      {question.label} {question.required && <span className="required">*</span>}
                    </h3>
                  </div>
                  
                  <div className="question-input">
                    {renderQuestion(question)}
                  </div>
                </div>
              ))}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setStep('name')}
                  className="back-btn"
                  disabled={submitting}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="submit-btn bw"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSubmit; 