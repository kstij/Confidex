import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import api from '../utils/api';
import './CreateForm.css';

const CreateForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domainRestrictions: '',
    isActive: true
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const workspaceId = location.state?.workspaceId || null;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const questionTypes = [
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'long-answer', label: 'Long Answer' },
    { value: 'rating', label: 'Rating' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'dropdown', label: 'Dropdown' }
  ];

  const addQuestion = () => {
    const newQuestion = {
      id: `q${Date.now()}`,
      type: 'short-answer',
      label: '',
      required: false,
      options: []
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push('');
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to create a form');
      return;
    }
    if (!formData.title.trim()) {
      setError('Form title is required');
      return;
    }
    if (questions.length === 0) {
      setError('At least one question is required');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.label.trim()) {
        setError(`Question ${i + 1} label is required`);
        return;
      }
      if ((question.type === 'checkbox' || question.type === 'dropdown') && question.options.length === 0) {
        setError(`Question ${i + 1} requires at least one option`);
        return;
      }
    }
    setLoading(true);
    setError('');
    try {
      const domainRestrictions = formData.domainRestrictions
        .split(',')
        .map(domain => domain.trim())
        .filter(domain => domain.length > 0);
      const formPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        domainRestrictions,
        isActive: formData.isActive,
        questions: questions.map(q => ({
          ...q,
          label: q.label.trim(),
          options: q.options.map(opt => opt.trim()).filter(opt => opt.length > 0)
        })),
        ...(workspaceId ? { workspaceId } : {})
      };
      const response = await api.post('/form/create', formPayload);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-form-page" style={{ background: '#fff', color: '#111' }}>
      <div className="create-form-container">
        <div className="create-form-header">
          <h1 className="create-form-title">Create a New Form</h1>
        </div>
        <div className="create-form-content">
          <form className="form-builder-content" onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="form-group">
                <label className="form-label required" htmlFor="title">Form Title</label>
                <input
                  className="form-input bnw-input"
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Untitled Form"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  className="form-textarea bnw-input"
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this form about?"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="domainRestrictions">Domain Restrictions</label>
                <input
                  className="form-input bnw-input"
                  type="text"
                  id="domainRestrictions"
                  value={formData.domainRestrictions}
                  onChange={e => setFormData({ ...formData, domainRestrictions: e.target.value })}
                  placeholder="e.g. company.com, gmail.com (comma-separated)"
                />
                <small className="bnw-hint">Leave empty to allow all domains</small>
              </div>
            </div>
            <div className="form-section">
              <div className="section-header">
                <h2>Questions ({questions.length})</h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="add-question-btn"
                >
                  + Add Question
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="empty-questions">
                  <p>No questions added yet. Click "Add Question" to get started.</p>
                </div>
              ) : (
                <div className="questions-list">
                  {questions.map((question, index) => (
                    <div key={question.id} className="question-card">
                      <div className="question-card-header">
                        <span className="question-number-badge">#{index + 1}</span>
                        <div className="question-type-col">
                          <label htmlFor={`question-type-${index}`}>Question Type</label>
                          <select
                            id={`question-type-${index}`}
                            className="form-select"
                            value={question.type}
                            onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                          >
                            {questionTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="question-delete-btn"
                          aria-label="Delete question"
                        >
                          ×
                        </button>
                      </div>
                      <div className="question-content">
                        <div className="form-group">
                          <label>Question Label *</label>
                          <input
                            className="form-input bnw-input question-label-input"
                            type="text"
                            value={question.label}
                            onChange={(e) => updateQuestion(index, 'label', e.target.value)}
                            placeholder="Enter question"
                            required
                          />
                        </div>

                        {(question.type === 'checkbox' || question.type === 'dropdown') && (
                          <div className="form-group">
                            <label>Options *</label>
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="option-input">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOption(index, optionIndex)}
                                  className="remove-option-btn"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addOption(index)}
                              className="add-option-btn"
                            >
                              + Add Option
                            </button>
                          </div>
                        )}

                        {question.type === 'rating' && (
                          <div className="rating-options">
                            <div className="form-group">
                              <label>Minimum Rating</label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={question.minRating || 1}
                                onChange={(e) => updateQuestion(index, 'minRating', parseInt(e.target.value))}
                              />
                            </div>
                            <div className="form-group">
                              <label>Maximum Rating</label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={question.maxRating || 5}
                                onChange={(e) => updateQuestion(index, 'maxRating', parseInt(e.target.value))}
                              />
                            </div>
                          </div>
                        )}

                        <div className="form-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                            />
                            Required question
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {error && <div className="error-message bnw-error">{error}</div>}
            <div className="form-actions bnw-actions">
              <button className="form-action-btn primary bnw-btn" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Form'}
              </button>
              <button className="form-action-btn secondary bnw-btn" type="button" onClick={() => navigate('/dashboard')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateForm; 