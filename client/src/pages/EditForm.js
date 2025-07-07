import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './EditForm.css';

const EditForm = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domainRestrictions: '',
    isActive: true
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const questionTypes = [
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'long-answer', label: 'Long Answer' },
    { value: 'rating', label: 'Rating' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'dropdown', label: 'Dropdown' }
  ];

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      const response = await api.get(`/form/${formId}/edit`);
      
      const form = response.data;
      setFormData({
        title: form.title,
        description: form.description,
        domainRestrictions: form.domainRestrictions.join(', '),
        isActive: form.isActive
      });
      setQuestions(form.questions);
    } catch (error) {
      console.error('Form fetch error:', error);
      setError(error.response?.data?.error || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Form title is required');
      return;
    }

    if (questions.length === 0) {
      setError('At least one question is required');
      return;
    }

    // Validate questions
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

    setSaving(true);
    setError('');

    try {
      // Parse domain restrictions
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
        }))
      };

      await api.put(`/form/${formId}`, formPayload);

      console.log('Form updated successfully');
      navigate(`/my-forms`);
    } catch (error) {
      console.error('Form update error:', error);
      setError(error.response?.data?.error || 'Failed to update form');
    } finally {
      setSaving(false);
    }
  };

  const copyFormLink = () => {
    const link = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(link);
    alert('Form link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="edit-form">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading form...</p>
        </div>
      </div>
    );
  }

  if (error && error.includes('Access denied')) {
    return (
      <div className="edit-form">
        <div className="error-container">
          <h2>Access Denied</h2>
          <p>You can only edit forms that you created.</p>
          <button onClick={() => navigate('/my-forms')} className="back-btn">
            Go to My Forms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <h2 className="page-title">Edit Form</h2>
      <div className="page-content">
        <div className="edit-form">
          <div className="form-container">
            <div className="form-header">
              <h1>Edit Form</h1>
              <div className="form-actions-header">
                <button onClick={copyFormLink} className="copy-link-btn">
                  Copy Form Link
                </button>
                <span className={`form-status ${formData.isActive ? 'active' : 'inactive'}`}>
                  {formData.isActive ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="form-section">
                <h2>Form Details</h2>
                
                <div className="form-group">
                  <label htmlFor="title">Form Title *</label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter form title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter form description"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="domainRestrictions">Domain Restrictions</label>
                  <input
                    type="text"
                    id="domainRestrictions"
                    value={formData.domainRestrictions}
                    onChange={(e) => setFormData({...formData, domainRestrictions: e.target.value})}
                    placeholder="e.g., company.com, gmail.com (comma-separated)"
                  />
                  <small>Leave empty to allow all domains</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    Form is active (can receive responses)
                  </label>
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
                        <div className="question-header">
                          <span className="question-number">Question {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="remove-question-btn"
                          >
                            ×
                          </button>
                        </div>

                        <div className="question-content">
                          <div className="question-row">
                            <div className="question-label-col">
                              <label>Question Label</label>
                              <input
                                className="edit-question-label-input"
                                type="text"
                                value={question.label}
                                onChange={(e) => updateQuestion(index, 'label', e.target.value)}
                                placeholder="Enter question"
                                required
                              />
                            </div>
                            <div className="question-type-col">
                              <label>Question Type</label>
                              <select
                                className="edit-question-type-select"
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

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/my-forms')}
                  className="cancel-btn"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditForm; 