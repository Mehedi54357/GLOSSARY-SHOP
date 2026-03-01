import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deleteProduct, getAllProducts, openDatabase, Product } from '../../services/database';

export default function InventoryScreen() {
  const [db, setDb] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const initDb = async () => {
      const database = await openDatabase();
      setDb(database);
      loadProducts(database);
    };
    initDb();
  }, []);

  const loadProducts = async (database: any) => {
    const allProducts = await getAllProducts(database);
    setProducts(allProducts);
  };

  const handleDelete = (id: number) => {
    Alert.alert('নিশ্চিত করুন', 'প্রোডাক্টটি ডিলিট করতে চান?', [
      { text: 'বাতিল', style: 'cancel' },
      { 
        text: 'ডিলিট', 
        onPress: async () => {
          await deleteProduct(db, id);
          loadProducts(db);
        }
      },
    ]);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Text style={styles.productName}>{item.name}</Text>
      {item.dialectName && <Text>({item.dialectName})</Text>}
      <Text>পরিমাণ: {item.quantity} | মূল্য: ৳{item.price}</Text>
      <TouchableOpacity onPress={() => handleDelete(item.id!)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>ডিলিট</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text>কোনো প্রোডাক্ট নেই</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  productCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
});