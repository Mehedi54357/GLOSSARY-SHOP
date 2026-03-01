import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useVoiceRecognition } from '../../hooks/UseVoiceRecognition';
import { convertDialectToStandard, getAllProducts, openDatabase, Product, setupDatabase } from '../../services/database';

export default function HomeScreen() {
  const [db, setDb] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const { isListening, transcript, error, startListening, stopListening } = useVoiceRecognition();
  const [convertedText, setConvertedText] = useState('');

  useEffect(() => {
    const initDb = async () => {
      const database = await openDatabase();
      await setupDatabase(database);
      setDb(database);
      loadProducts(database);
    };
    initDb();
  }, []);

  useEffect(() => {
    if (transcript && db) {
      convertDialectToStandard(db, transcript).then(setConvertedText);
    }
  }, [transcript, db]);

  const loadProducts = async (database: any) => {
    const allProducts = await getAllProducts(database);
    setProducts(allProducts);
  };

  const handleVoicePress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.voiceSection}>
        <TouchableOpacity 
          style={[styles.voiceButton, isListening && styles.listening]} 
          onPress={handleVoicePress}
        >
          <Text style={styles.voiceButtonText}>
            {isListening ? '⏹️ থামুন' : '🎤 কথা বলুন'}
          </Text>
        </TouchableOpacity>
        
        {error && <Text style={styles.error}>{error}</Text>}
        
        {transcript ? (
          <View style={styles.transcriptContainer}>
            <Text style={styles.label}>আপনার বলা কথা (আঞ্চলিক):</Text>
            <Text style={styles.transcript}>{transcript}</Text>
            <Text style={styles.label}>সাধারণ বাংলায়:</Text>
            <Text style={styles.converted}>{convertedText}</Text>
          </View>
        ) : null}
      </View>

      <ScrollView style={styles.productList}>
        <Text style={styles.sectionTitle}>প্রোডাক্ট লিস্ট</Text>
        {products.map((item) => (
          <View key={item.id} style={styles.productCard}>
            <Text style={styles.productName}>{item.name}</Text>
            {item.dialectName && <Text>({item.dialectName})</Text>}
            <Text>পরিমাণ: {item.quantity} | মূল্য: ৳{item.price}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  voiceSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  voiceButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginVertical: 10,
  },
  listening: {
    backgroundColor: '#FF3B30',
  },
  voiceButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginVertical: 5,
  },
  transcriptContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 10,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 5,
  },
  transcript: {
    fontSize: 16,
    marginBottom: 5,
  },
  converted: {
    fontSize: 16,
    color: '#007AFF',
  },
  productList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
});