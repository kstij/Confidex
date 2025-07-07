import React, { useState } from 'react';
import './FormBuilder.css';

const FormBuilder = ({ onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    allowedEmails: '',
    allowedDomains: '',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    id: '',
    type: 'short',
    label: '',
    options: [''],
    required: false
  });

  const questionTypes = [
    { value: 'short', label: 'Short Answer' },
    { value: 'rating', label: 'Rating (1-5)' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'multiple-choice', label: 'Multiple Choice' }
  ];

  const addQuestion = () => {
    if (!currentQuestion.label.trim()) return;
    
    const newQuestion = {
      ...currentQuestion,
      id: `q${Date.now()}`,
      options: currentQuestion.type === 'short' || currentQuestion.type === 'rating' 
        ? [] 
        : currentQuestion.options.filter(opt => opt.trim())
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    setCurrentQuestion({
      id: '',
      type: 'short',
      label: '',
      options: [''],
      required: false
    });
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestionOptions = (index, optionIndex, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === optionIndex ? value : opt)
    }));
  };

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim() || formData.questions.length === 0) {
      alert('Please add a title and at least one question');
      return;
    }

    const processedData = {
      ...formData,
      allowedEmails: formData.allowedEmails.split(',').map(email => email.trim()).filter(Boolean),
      allowedDomains: formData.allowedDomains.split(',').map(domain => domain.trim()).filter(Boolean)
    };

    onSave(processedData);
  };

  return (
    <div className="form-builder">
      <h2>Create Feedback Form</h2>
      
      <div className="form-section">
        <h3>Form Details</h3>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter form title"
          />
        </div>
        
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter form description"
          />
        </div>
        
        <div className="form-group">
          <label>Allowed Emails (comma-separated):</label>
          <input
            type="text"
            value={formData.allowedEmails}
            onChange={(e) => setFormData(prev => ({ ...prev, allowedEmails: e.target.value }))}
            placeholder="user@company.com, hr@org.org"
          />
        </div>
        
        <div className="form-group">
          <label>Allowed Domains (comma-separated):</label>
          <input
            type="text"
            value={formData.allowedDomains}
            onChange={(e) => setFormData(prev => ({ ...prev, allowedDomains: e.target.value }))}
            placeholder="@company.com, @org.org"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Questions</h3>
        
        <div className="question-builder">
          <div className="form-group">
            <label>Question Type:</label>
            <select
              value={currentQuestion.type}
              onChange={(e) => setCurrentQuestion(prev => ({ 
                ...prev, 
                type: e.target.value,
                options: e.target.value === 'short' || e.target.value === 'rating' ? [] : ['']
              }))}
            >
              {questionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Question Label:</label>
            <input
              type="text"
              value={currentQuestion.label}
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Enter question"
            />
          </div>
          
          {(currentQuestion.type === 'checkbox' || currentQuestion.type === 'dropdown' || currentQuestion.type === 'multiple-choice') && (
            <div className="form-group">
              <label>Options:</label>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="option-input">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateQuestionOptions(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={addOption} className="add-btn">
                Add Option
              </button>
            </div>
          )}
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={currentQuestion.required}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, required: e.target.checked }))}
              />
              Required
            </label>
          </div>
          
          <button type="button" onClick={addQuestion} className="add-question-btn">
            Add Question
          </button>
        </div>
        
        <div className="questions-list">
          {formData.questions.map((question, index) => (
            <div key={index} className="question-item">
              <div className="question-header">
                <span className="question-number">Q{index + 1}</span>
                <span className="question-type">{question.type}</span>
                <button
                  onClick={() => removeQuestion(index)}
                  className="remove-question-btn"
                >
                  Remove
                </button>
              </div>
              <div className="question-content">
                <strong>{question.label}</strong>
                {question.required && <span className="required-badge">Required</span>}
                {question.options.length > 0 && (
                  <div className="question-options">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="option-display">
                        • {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="form-actions">
        <button onClick={handleSave} className="save-btn">
          Create Form
        </button>
      </div>
    </div>
  );
};

export default FormBuilder; 