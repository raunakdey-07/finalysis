import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Text, Keyboard, Dimensions, Platform } from 'react-native';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Debounce helper function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuggestionsFromAPI = async (query) => {
    if (!query || query.trim().length < 1) {
      setSuggestions([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    console.log(`[HomeScreen] Fetching suggestions for: "${query}"`);

    // IMPORTANT: For local development, assuming netlify dev runs on port 8888.
    // Change '8888' if your netlify dev server uses a different port.
    // For production, this should revert to: `/.netlify/functions/searchStocks?q=...`
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8888' 
      : '';
    const fetchURL = `${baseUrl}/.netlify/functions/searchStocks?q=${encodeURIComponent(query.trim())}`;
    
    console.log(`[HomeScreen] Using fetch URL: ${fetchURL}`);

    try {
      const response = await fetch(fetchURL);
      console.log(`[HomeScreen] API Response Status: ${response.status}, Status Text: ${response.statusText}`);

      const responseText = await response.text();
      console.log(`[HomeScreen] API Raw Response: ${responseText ? responseText.substring(0, 300) + (responseText.length > 300 ? '...' : '') : '(empty)'}`);

      if (!response.ok) {
        // Try to parse error from response if it's JSON, otherwise use statusText
        let apiErrorMsg = response.statusText;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData && errorData.error) {
            apiErrorMsg = errorData.error.details || errorData.error.message || errorData.error;
          }
        } catch (e) { /* Ignore parsing error, use statusText */ }
        throw new Error(`API request failed: ${response.status}. ${apiErrorMsg}`);
      }

      const data = JSON.parse(responseText);
      console.log('[HomeScreen] API Parsed Data:', data);

      // Expecting data to be an array of {id, title} from searchStocks.js
      if (Array.isArray(data) && data.every(item => typeof item.id !== 'undefined' && typeof item.title !== 'undefined')) {
        setSuggestions(data);
      } else {
        console.warn('[HomeScreen] Parsed data is not in the expected format (array of {id, title}):', data);
        setSuggestions([]);
        // setError('Received unexpected data format from server.'); // Optional: inform user
      }

    } catch (e) {
      console.error('[HomeScreen] Error fetching or parsing suggestions:', e);
      setError(e.message || 'Failed to fetch suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestionsFromAPI, 350), []);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      setError(null);
      setLoading(false); // Stop loading if query is cleared
      return;
    }
    debouncedFetchSuggestions(searchQuery);
  }, [searchQuery, debouncedFetchSuggestions]);

  const handleSelectItem = (item) => {
    if (item && typeof item.id !== 'undefined') { // Check item.id specifically
      console.log('[HomeScreen] Item selected:', item);
      Keyboard.dismiss();
      setSearchQuery(''); // Clear search query
      setSuggestions([]); // Clear suggestions
      setError(null);     // Clear any errors
      navigation.replace('Report', { ticker: item.id });
    } else {
      console.log('[HomeScreen] Invalid item selected or item has no id:', item);
    }
  };

  // Determine the empty result text based on state
  let emptyText = 'Type to search for stocks';
  if (error) {
    emptyText = error;
  } else if (searchQuery.trim().length > 0 && !loading && suggestions.length === 0) {
    emptyText = 'No suggestions found.';
  } else if (loading && searchQuery.trim().length > 0) {
    emptyText = 'Fetching suggestions...'; // Or rely on the loading prop's visual cue
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Text style={styles.logoText}>Finalysis</Text>
        <View style={styles.searchBarWrapper}>
          <MaterialIcons name="search" size={24} color="#9e9e9e" style={styles.searchIcon} />
          <AutocompleteDropdown
            key="stock-search-dropdown"
            clearButtonMode="while-editing"
            dataSet={suggestions}
            onChangeText={setSearchQuery}
            onSelectItem={handleSelectItem}
            loading={loading && searchQuery.trim().length > 0} // Show loader only when actively searching
            useFilter={false}
            textInputProps={{
              value: searchQuery,
              placeholder: 'Search stocks (e.g., AAPL, MSFT)',
              placeholderTextColor: '#9e9e9e',
              style: styles.input,
              autoCorrect: false,
              autoCapitalize: 'none',
            }}
            rightButtonsContainerStyle={styles.rightButtonsContainer}
            suggestionsListMaxHeight={Dimensions.get('window').height * 0.4}
            suggestionsListContainerStyle={styles.suggestionsListStyle}
            containerStyle={styles.autocompleteContainer}
            renderItem={(item, searchText) => (
              <Text style={styles.suggestionItemText}>{item.title}</Text>
            )}
            inputHeight={50}
            showClear={searchQuery.length > 0}
            emptyResultText={emptyText} // Use the determined empty text
            // The component's internal loading indicator might be sufficient.
            // If a more prominent global loading indicator is needed when suggestions are empty:
            // {loading && searchQuery.trim().length > 0 && suggestions.length === 0 && <ActivityIndicator style={styles.inlineActivityIndicator} color="#E0E0E0" />}
          />
        </View>
        {/* Display error prominently if it's not shown in emptyResultText or if it's a general error */}
        {error && !loading && <Text style={styles.errorText}>{error}</Text>}
        {/* The inlineActivityIndicator can be used if the dropdown's own 'loading' visual is not enough */}
        {/* {loading && !suggestions.length && searchQuery.trim().length > 0 && <ActivityIndicator style={styles.inlineActivityIndicator} color="#E0E0E0" />} */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Darker background for more contrast, Google-like
    paddingHorizontal: 20, // Increased padding
    paddingTop: '10%', // Adjusted top padding
    alignItems: 'center',
  },
  searchSection: {
    width: '100%',
    maxWidth: 600, // Max width for the search area
    alignItems: 'center',
  },
  logoText: {
    fontSize: 60, // Larger logo text
    fontWeight: 'bold',
    color: '#E0E0E0', // Light grey, common for text on dark backgrounds
    marginBottom: 30, // More space below logo
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-condensed', // Common clean fonts
    letterSpacing: -1, // Slight tightening of letter spacing
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e', // Slightly different dark shade for the bar
    borderRadius: 30, // Even more rounded
    paddingHorizontal: 20, // More padding inside search bar
    height: 58, // Slightly taller
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1, // Subtle border
    borderColor: '#2a2a2a', // Dark border color
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 15, // More space for icon
  },
  autocompleteContainer: {
    flex: 1,
  },
  input: {
    color: '#f0f0f0',
    fontSize: 18, // Slightly larger font in input
    // backgroundColor: 'transparent', // Already handled
    paddingVertical: 0,
    lineHeight: 24, // Adjust if necessary
  },
  rightButtonsContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 8, // Adjust if clear button needs more space
  },
  suggestionsListStyle: {
    backgroundColor: '#1e1e1e', // Match search bar background
    borderColor: '#2a2a2a', // Match search bar border
    borderWidth: 1,
    borderRadius: 12, // More rounded suggestions
    marginTop: 8, // Space from search bar
  },
  suggestionItemText: {
    color: '#e0e0e0', // Consistent light text color
    paddingVertical: 15, // More padding
    paddingHorizontal: 20, // More padding
    fontSize: 16,
    borderBottomWidth: 1, // Separator for items
    borderBottomColor: '#2a2a2a', // Subtle separator
  },
  errorText: {
    color: '#ff8a80', // A slightly less harsh red
    marginTop: 10,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});