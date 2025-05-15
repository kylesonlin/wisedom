import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Autocomplete,
  CircularProgress,
  Typography
} from '@mui/material';
import { 
  Search as SearchIcon,
  Clear as ClearIcon 
} from '@mui/icons-material';
import { ContactsService, Contact } from '@/services/contacts';

interface ContactSearchProps {
  onSelect: (contact: Contact) => void;
  placeholder?: string;
}

export const ContactSearch: React.FC<ContactSearchProps> = ({ 
  onSelect,
  placeholder = 'Search contacts...'
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Contact[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions([]);
      return undefined;
    }

    const searchContacts = async () => {
      setLoading(true);
      try {
        const results = await ContactsService.searchContacts(inputValue);
        if (active) {
          setOptions(results);
        }
      } catch (error) {
        console.error('Error searching contacts:', error);
        if (active) {
          setOptions([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(searchContacts, 300);

    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [inputValue]);

  const handleClear = () => {
    setInputValue('');
    setOptions([]);
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
      filterOptions={(x) => x}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={null}
      onChange={(event, newValue) => {
        if (newValue) {
          onSelect(newValue);
        }
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : inputValue ? (
                  <IconButton
                    size="small"
                    onClick={handleClear}
                  >
                    <ClearIcon />
                  </IconButton>
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box>
            <Typography variant="body1">
              {option.first_name} {option.last_name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {option.email}
              {option.company && ` • ${option.company}`}
            </Typography>
          </Box>
        </Box>
      )}
      noOptionsText="No contacts found"
    />
  );
}; 