import React from 'react';
import Select, { type Props as SelectProps } from 'react-select';

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps extends Omit<SelectProps<Option, false>, 'onChange' | 'value' | 'options'> {
  options: Option[];
  value: string | number | '';
  onChange: (value: string | number) => void;
  placeholder?: string;
  required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Pilih...', 
  required,
  ...rest 
}) => {
  const selectedOption = options.find(opt => opt.value.toString() === value.toString()) || null;

  return (
    <div className="relative">
      <Select
        value={selectedOption}
        onChange={(selected) => onChange(selected ? selected.value : '')}
        options={options}
        placeholder={placeholder}
        isClearable
        isSearchable
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          control: (base, state) => ({
            ...base,
            border: state.isFocused ? '1px solid #4CAF50' : '1px solid #e5e7eb',
            borderRadius: '0.75rem', // rounded-xl
            padding: '0.125rem 0.25rem', // py-2.5 px-4 approx
            boxShadow: state.isFocused ? '0 0 0 2px rgba(76, 175, 80, 0.3)' : 'none',
            '&:hover': {
              border: state.isFocused ? '1px solid #4CAF50' : '1px solid #d1d5db'
            }
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected 
              ? '#4CAF50' 
              : state.isFocused ? '#f3f4f6' : 'white',
            color: state.isSelected ? 'white' : '#374151',
            cursor: 'pointer',
            '&:active': {
              backgroundColor: '#4CAF50',
              color: 'white'
            }
          }),
          menu: (base) => ({
            ...base,
            borderRadius: '0.75rem',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          })
        }}
        {...rest}
      />
      {/* Hidden input for HTML5 validation */}
      {required && (
        <input
          tabIndex={-1}
          autoComplete="off"
          style={{
            opacity: 0,
            width: '100%',
            height: 1,
            position: 'absolute',
            bottom: 0
          }}
          value={value}
          onChange={() => {}}
          required={required}
        />
      )}
    </div>
  );
};

export default SearchableSelect;
