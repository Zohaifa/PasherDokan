import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet, 
    Alert, 
    TouchableOpacity, 
    SafeAreaView, 
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import ShopkeeperLayout from './BottomNav';
import LogoutButton from '../../components/LogoutButton';

const AddProduct: React.FC = () => {
    const [productName, setProductName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { shopId } = useLocalSearchParams();

    const handleAddProduct = async () => {
        if (!productName || !category || !price || !stock) {
            Alert.alert('Missing Information', 'Please fill in all fields to continue.');
            return;
        }

        try {
            setLoading(true);
            await api.post('/products', {
                name: productName,
                category,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                shop: shopId,
            });
            Alert.alert('Success', 'Product added successfully!');
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to add product. Please try again.');
            console.error('Add product error:', error);
        } finally {
            setLoading(false);
        }
    };

    const PageContent = () => (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Add Product</Text>
                        <Text style={styles.headerSubtitle}>Create new inventory item</Text>
                    </View>
                </View>
                <LogoutButton />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.formContainer}>
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Product Details</Text>
                            
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Product Name</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="pricetag-outline" size={20} color="#6a89cc" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter product name"
                                        placeholderTextColor="#a0a0a0"
                                        value={productName}
                                        onChangeText={setProductName}
                                    />
                                </View>
                            </View>
                            
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Category</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="grid-outline" size={20} color="#6a89cc" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g., Food, Electronics, Clothing"
                                        placeholderTextColor="#a0a0a0"
                                        value={category}
                                        onChangeText={setCategory}
                                    />
                                </View>
                            </View>
                        </View>
                        
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Pricing & Inventory</Text>
                            
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Price (Taka)</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="cash-outline" size={20} color="#6a89cc" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter price"
                                        placeholderTextColor="#a0a0a0"
                                        value={price}
                                        onChangeText={setPrice}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                            
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Stock Quantity</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="cube-outline" size={20} color="#6a89cc" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Available quantity"
                                        placeholderTextColor="#a0a0a0"
                                        value={stock}
                                        onChangeText={setStock}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Shop Information</Text>
                            <View style={styles.shopInfoBox}>
                                <Ionicons name="storefront-outline" size={22} color="#4a69bd" />
                                <Text style={styles.shopIdText}>
                                    Adding to Shop ID: <Text style={styles.shopIdValue}>{shopId}</Text>
                                </Text>
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={styles.submitButton}
                                onPress={handleAddProduct}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <>
                                        <Ionicons name="add-circle" size={20} color="#fff" />
                                        <Text style={styles.submitButtonText}>Add to Inventory</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={() => router.back()}
                                disabled={loading}
                            >
                                <Ionicons name="close-circle" size={20} color="#fff" />
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );

    return (
        <ShopkeeperLayout currentTab="AddProduct">
            <PageContent />
        </ShopkeeperLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e5eb',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2c3e50',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 100,
    },
    formContainer: {
        flex: 1,
    },
    formSection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2c3e50',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 8,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e1e5eb',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    inputIcon: {
        padding: 10,
    },
    input: {
        flex: 1,
        height: 46,
        paddingHorizontal: 8,
        fontSize: 16,
        color: '#2c3e50',
    },
    shopInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef2ff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#d1dafa',
    },
    shopIdText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#4a5568',
    },
    shopIdValue: {
        fontWeight: '700',
        color: '#4a69bd',
    },
    buttonContainer: {
        marginTop: 10,
        gap: 14,
    },
    submitButton: {
        backgroundColor: '#4a69bd',
        paddingVertical: 16,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4a69bd',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    cancelButton: {
        backgroundColor: '#64748b',
        paddingVertical: 16,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default AddProduct;