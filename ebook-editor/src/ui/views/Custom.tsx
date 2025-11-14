import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SimpleInput } from '../components/Input';
import { SimpleSelect } from '../components/Select';
import { SimpleRadio } from '../components/Radio';
import { SimpleTextarea } from '../components/Textarea';
import { SimpleCheckbox } from '../components/Checkbox';
import { SimpleButton } from '../components/Button';
import { SimpleRange } from '../components/Range';
import { SimpleModal, ModalFooter } from '../components/Modal';
import '../../styles/theme.css';
import '../../styles/book.css';

export const Custom: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [radioValue, setRadioValue] = useState('option1');
  const [textareaValue, setTextareaValue] = useState('');
  const [checkboxValue1, setCheckboxValue1] = useState(false);
  const [checkboxValue2, setCheckboxValue2] = useState(true);
  const [checkboxValue3, setCheckboxValue3] = useState(false);
  const [rangeValue, setRangeValue] = useState(50);
  const [isModalOpen, setIsModalOpen] = useState(false);
    
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectValue(e.target.value);
  };

  const handleRadioChange = (value: string) => {
    setRadioValue(value);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(e.target.value);
  };

  const handleCheckboxChange = (setter: React.Dispatch<React.SetStateAction<boolean>>) => (checked: boolean) => {
    setter(checked);
  };

  const handleSubmit = () => {
    console.log('Form submitted:', {
      input: inputValue,
      select: selectValue,
      radio: radioValue,
      textarea: textareaValue,
      range: rangeValue,
      checkboxes: {
        terms: checkboxValue1,
        newsletter: checkboxValue2,
        notifications: checkboxValue3
      }
    });
  };

  return (
    <div className="editor-layout">
      <Header />

      <div className="editor-content">
        <div className="editor-content-wrapper">
          {/* Page Header */}
          <div className="custom-page-header">
            <h1 className="custom-page-title">Component Showcase</h1>
            <p className="custom-page-description">
              Test all custom components based on GrapesJS design patterns
            </p>
            <div className="custom-page-actions">
              <SimpleButton
                variant="primary"
                onClick={handleSubmit}
              >
                Submit Form
              </SimpleButton>
              <SimpleButton
                variant="secondary"
                onClick={() => setIsModalOpen(true)}
              >
                Show Modal
              </SimpleButton>
              <Link to="/" className="book-card-link">
                <SimpleButton variant="outline">
                  Back to Home
                </SimpleButton>
              </Link>
            </div>
          </div>

          {/* Form Container */}
          <div className="custom-form-container">
            <div className="custom-form-grid">

              {/* Input Components Section */}
              <div className="custom-section">
                <h2 className="custom-section-title">Input Components</h2>
                <div className="custom-component-grid">

                  {/* Basic Input */}
                  <div className="custom-component-item">
                    <SimpleInput
                      label="Basic Input"
                      placeholder="Enter text..."
                      value={inputValue}
                      onChange={handleInputChange}
                      helperText="This is a basic text input"
                    />
                  </div>

                  {/* Input with Icon Left */}
                  <div className="custom-component-item">
                    <SimpleInput
                      label="Input with Left Icon"
                      placeholder="Search..."
                      iconLeft="fas fa-search"
                      helperText="Icon positioned on the left"
                    />
                  </div>

                  {/* Input with Icon Right */}
                  <div className="custom-component-item">
                    <SimpleInput
                      label="Input with Right Icon"
                      placeholder="Enter email..."
                      iconRight="fas fa-envelope"
                      helperText="Icon positioned on the right"
                    />
                  </div>

                  {/* Error Input */}
                  <div className="custom-component-item">
                    <SimpleInput
                      label="Error State"
                      placeholder="Invalid input..."
                      error
                      helperText="This field has an error"
                    />
                  </div>

                  {/* Disabled Input */}
                  <div className="custom-component-item">
                    <SimpleInput
                      label="Disabled Input"
                      placeholder="Cannot edit..."
                      disabled
                      helperText="This input is disabled"
                    />
                  </div>

                  {/* Required Input */}
                  <div className="custom-component-item">
                    <SimpleInput
                      label="Required Field"
                      placeholder="Required..."
                      required
                      helperText="This field is required"
                    />
                  </div>
                </div>
              </div>

              {/* Select Components Section */}
              <div className="custom-section">
                <h2 className="custom-section-title">Select Components</h2>
                <div className="custom-component-grid">

                  {/* Basic Select */}
                  <div className="custom-component-item">
                    <SimpleSelect
                      label="Basic Select"
                      value={selectValue}
                      onChange={handleSelectChange}
                      helperText="Choose an option"
                    >
                      <option value="">Select an option...</option>
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option>
                    </SimpleSelect>
                  </div>

                  {/* Select with Icon */}
                  <div className="custom-component-item">
                    <SimpleSelect
                      label="Select with Icon"
                      iconLeft="fas fa-list"
                      helperText="Select with left icon"
                    >
                      <option value="">Choose category...</option>
                      <option value="tech">Technology</option>
                      <option value="design">Design</option>
                      <option value="business">Business</option>
                    </SimpleSelect>
                  </div>

                  {/* Disabled Select */}
                  <div className="custom-component-item">
                    <SimpleSelect
                      label="Disabled Select"
                      disabled
                      helperText="Cannot select options"
                    >
                      <option value="">Disabled...</option>
                      <option value="1">Option 1</option>
                      <option value="2">Option 2</option>
                    </SimpleSelect>
                  </div>
                </div>
              </div>

              {/* Radio Components Section */}
              <div className="custom-section">
                <h2 className="custom-section-title">Radio Components</h2>
                <div className="custom-component-grid">

                  {/* Basic Radio */}
                  <div className="custom-component-item">
                    <SimpleRadio
                      label="Choose Platform"
                      name="platform"
                      value={radioValue}
                      onChange={handleRadioChange}
                      options={[
                        { value: 'option1', label: 'Windows' },
                        { value: 'option2', label: 'macOS' },
                        { value: 'option3', label: 'Linux' }
                      ]}
                      helperText="Select your preferred platform"
                    />
                  </div>

                  {/* Radio with Disabled Option */}
                  <div className="custom-component-item">
                    <SimpleRadio
                      label="Choose Plan"
                      name="plan"
                      options={[
                        { value: 'free', label: 'Free Plan' },
                        { value: 'pro', label: 'Pro Plan' },
                        { value: 'enterprise', label: 'Enterprise', disabled: true }
                      ]}
                      helperText="Select your subscription plan"
                    />
                  </div>
                </div>
              </div>

              {/* Textarea Components Section */}
              <div className="custom-section">
                <h2 className="custom-section-title">Textarea Components</h2>
                <div className="custom-component-grid">

                  {/* Basic Textarea */}
                  <div className="custom-component-item">
                    <SimpleTextarea
                      label="Description"
                      placeholder="Enter your description here..."
                      value={textareaValue}
                      onChange={handleTextareaChange}
                      rows={4}
                      helperText="Tell us more about yourself"
                    />
                  </div>

                  {/* Large Textarea */}
                  <div className="custom-component-item">
                    <SimpleTextarea
                      label="Detailed Feedback"
                      placeholder="Provide detailed feedback..."
                      rows={6}
                      maxLength={500}
                      helperText="Maximum 500 characters"
                    />
                  </div>

                  {/* Disabled Textarea */}
                  <div className="custom-component-item">
                    <SimpleTextarea
                      label="Disabled Textarea"
                      placeholder="Cannot edit..."
                      disabled
                      rows={3}
                      helperText="This textarea is disabled"
                    />
                  </div>
                </div>
              </div>

              {/* Checkbox Components Section */}
              <div className="custom-section">
                <h2 className="custom-section-title">Checkbox Components</h2>
                <div className="custom-component-grid">

                  {/* Basic Checkbox */}
                  <div className="custom-component-item">
                    <SimpleCheckbox
                      label="I agree to the terms and conditions"
                      checked={checkboxValue1}
                      onChange={handleCheckboxChange(setCheckboxValue1)}
                      helperText="You must accept the terms to continue"
                    />
                  </div>

                  {/* Pre-checked Checkbox */}
                  <div className="custom-component-item">
                    <SimpleCheckbox
                      label="Subscribe to newsletter"
                      checked={checkboxValue2}
                      onChange={handleCheckboxChange(setCheckboxValue2)}
                      helperText="Get updates about new features"
                    />
                  </div>

                  {/* Indeterminate Checkbox */}
                  <div className="custom-component-item">
                    <SimpleCheckbox
                      label="Select all options"
                      indeterminate
                      checked={checkboxValue3}
                      onChange={handleCheckboxChange(setCheckboxValue3)}
                      helperText="Use this for select all functionality"
                    />
                  </div>

                  {/* Disabled Checkbox */}
                  <div className="custom-component-item">
                    <SimpleCheckbox
                      label="Disabled option"
                      disabled
                      helperText="This checkbox is disabled"
                    />
                  </div>

                  {/* Required Checkbox */}
                  <div className="custom-component-item">
                    <SimpleCheckbox
                      label="Required field"
                      required
                      helperText="This field is required"
                    />
                  </div>

                  {/* Error Checkbox */}
                  <div className="custom-component-item">
                    <SimpleCheckbox
                      label="Error state"
                      error
                      helperText="This field has an error"
                    />
                  </div>

                </div>
              </div>

              {/* Range Components Section */}
              <div className="custom-section">
                <h2 className="custom-section-title">Range Components</h2>
                <div className="custom-component-grid">

                  {/* Basic Range */}
                  <div className="custom-component-item">
                    <SimpleRange
                      label="Volume Control"
                      min={0}
                      max={100}
                      value={rangeValue}
                      onChange={setRangeValue}
                      valueSuffix="%"
                      helperText="Adjust volume level"
                    />
                  </div>

                  {/* Range with Steps */}
                  <div className="custom-component-item">
                    <SimpleRange
                      label="Brightness"
                      min={0}
                      max={10}
                      step={1}
                      defaultValue={5}
                      valueSuffix="/10"
                      helperText="Set brightness level"
                    />
                  </div>

                  {/* Disabled Range */}
                  <div className="custom-component-item">
                    <SimpleRange
                      label="Disabled Range"
                      disabled
                      helperText="Cannot adjust value"
                    />
                  </div>
                </div>
              </div>

  
  
            </div>
          </div>

          {/* Form Values Display */}
          <div className="custom-values-display">
            <h3 className="custom-values-title">Current Form Values</h3>
            <div className="custom-values-grid">
              <div className="custom-value-item">
                <strong>Input:</strong> {inputValue || 'Empty'}
              </div>
              <div className="custom-value-item">
                <strong>Select:</strong> {selectValue || 'Not selected'}
              </div>
              <div className="custom-value-item">
                <strong>Radio:</strong> {radioValue || 'Not selected'}
              </div>
              <div className="custom-value-item">
                <strong>Textarea:</strong> {textareaValue.length > 0 ? `${textareaValue.length} chars` : 'Empty'}
              </div>
              <div className="custom-value-item">
                <strong>Range:</strong> {rangeValue}%
              </div>
                              <div className="custom-value-item">
                <strong>Terms:</strong> {checkboxValue1 ? 'Accepted' : 'Not accepted'}
              </div>
              <div className="custom-value-item">
                <strong>Newsletter:</strong> {checkboxValue2 ? 'Subscribed' : 'Not subscribed'}
              </div>
              <div className="custom-value-item">
                <strong>Select All:</strong> {checkboxValue3 ? 'Selected' : 'Not selected'}
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />

      {/* Modal Component */}
      <SimpleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modal Component Demo"
        size="md"
      >
        <div style={{ padding: '1rem 0' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
            This is a Modal Component
          </h3>
          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            The modal component supports various features including:
          </p>
          <ul style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            <li>Different sizes (sm, md, lg, xl, full)</li>
            <li>Backdrop click to close</li>
            <li>Escape key to close</li>
            <li>Custom content</li>
            <li>Footer with action buttons</li>
            <li>Smooth animations</li>
          </ul>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
            Try clicking the backdrop, pressing Escape, or the close button to test the modal interactions.
          </p>
        </div>

        <ModalFooter>
          <SimpleButton
            variant="outline"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </SimpleButton>
          <SimpleButton
            variant="primary"
            onClick={() => {
              alert('Modal confirmed!');
              setIsModalOpen(false);
            }}
          >
            Confirm Action
          </SimpleButton>
        </ModalFooter>
      </SimpleModal>
    </div>
  );
};