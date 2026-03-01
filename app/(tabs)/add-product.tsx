import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { addProduct, openDatabase } from '../../services/database';

export default function AddProductScreen() {
  const [db, setDb] = useState<any>(null);
  const [name, setName] = useState('');
  const [dialectName, setDialectName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    const initDb = async () => {
      const database = await openDatabase();
      setDb(database);
    };
    initDb();
  }, []);

  const handleAdd = async () => {
    if (!name || !quantity || !price) {
      Alert.alert('ত্রুটি', 'নাম, পরিমাণ ও মূল্য অবশ্যই দিতে হবে');
      return;
    }
    try {
      await addProduct(db, {
        name,
        dialectName: dialectName || undefined,
        quantity: parseInt(quantity),
        price: parseFloat(price),
      });
      Alert.alert('সফল', 'প্রোডাক্ট যোগ করা হয়েছে');
      setName('');
      setDialectName('');
      setQuantity('');
      setPrice('');
    } catch (error) {
      Alert.alert('ত্রুটি', 'প্রোডাক্ট যোগ করা যায়নি');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>নাম (সাধারণ বাংলা)</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="যেমন: চাল" />
      
      <Text style={styles.label}>আঞ্চলিক নাম (ঐচ্ছিক)</Text>
      <TextInput style={styles.input} value={dialectName} onChangeText={setDialectName} placeholder="যেমন: হান্দি" />
      
      <Text style={styles.label}>পরিমাণ</Text>
      <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="১০" />
      
      <Text style={styles.label}>মূল্য</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="১০০" />
      
      <Button title="প্রোডাক্ট যোগ করুন" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
});