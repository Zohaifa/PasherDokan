import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useAuth } from '../../utils/auth';
import api from '../../services/api';
import Button from '../../components/Button';

type RootStackParamList = {
  AddShop: undefined;
};

type Props = StackScreenProps<RootStackParamList, 'AddShop'>;

const AddShop: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');

  const handleCreateShop = async () => {
    try {
      const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
      await api.post('/shops', { name, type, location: { type: 'Point', coordinates: [lat, lng] } });
      Alert.alert('Success', 'Shop created successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create shop');
    }
  };

  if (!isAuthenticated) {
    return <Text>Please log in to add a shop</Text>;
  }

  return (
    <View>
      <Text>Create a New Shop</Text>
      <TextInput
        placeholder="Shop Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Type (e.g., Grocery)"
        value={type}
        onChangeText={setType}
      />
      <TextInput
        placeholder="Location (lat,lng)"
        value={location}
        onChangeText={setLocation}
      />
      <Button title="Create Shop" onPress={handleCreateShop} />
      <Button title="Cancel" onPress={() => navigation.goBack()} color="#FF3B30" />
    </View>
  );
};

export default AddShop;
