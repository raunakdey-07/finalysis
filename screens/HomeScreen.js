import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (q) => {
    if (!q || q.length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/.netlify/functions/searchStocks?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data);
    } catch (e) {
      setSuggestions([]);
    }
  };

  return (
    <View style={styles.container}>
      <AutocompleteDropdown
        suggestionsListMaxHeight={120}
        dataSet={suggestions}
        onChangeText={txt => {
          setQuery(txt);
          fetchSuggestions(txt);
        }}
        onSelectItem={item => {
          if (!item) return;
          navigation.replace('Report', { ticker: item.id });
        }}
        textInputProps={{
          placeholder: 'Search ticker…',
          placeholderTextColor: '#888',
          style: styles.input
        }}
        containerStyle={styles.dropdownContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#121212',
    padding: 16
  },
  dropdownContainer: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8
  },
  input: {
    color: '#fff',
    padding: 12,
    fontSize: 18
  }
});