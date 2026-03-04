import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useVoiceRecognition } from '../../hooks/UseVoiceRecognition';
import { addProduct, convertDialectToStandard, getAllProducts, openDatabase, Product, setupDatabase } from '../../services/database';

export default function HomeScreen() {
  const [db, setDb] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const { isListening, transcript, error, startListening, stopListening, isFinal } = useVoiceRecognition();
  const [convertedText, setConvertedText] = useState('');
  const [commandFeedback, setCommandFeedback] = useState('');

  useEffect(() => {
    const initDb = async () => {
      const database = await openDatabase();
      await setupDatabase(database);
      setDb(database);
      loadProducts(database);
    };
    initDb();
  }, []);

  // যখন ভয়েস ইনপুট শেষ হয় (isFinal true), তখন কনভার্ট ও কমান্ড হ্যান্ডল করুন
  useEffect(() => {
    if (isFinal && transcript && db) {
      convertDialectToStandard(db, transcript).then(converted => {
        setConvertedText(converted);
        handleVoiceCommand(converted);
      });
    }
  }, [isFinal, transcript, db]);

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

  // ভয়েস কমান্ড পার্স করার ফাংশন
  const handleVoiceCommand = async (text: string) => {
    if (!db) return;
    
    const words = text.trim().split(/\s+/);
    if (words.length < 2) {
      setCommandFeedback('দুঃখিত, সঠিক ফরম্যাটে বলুন। যেমন: "যোগ চাল" অথবা "যোগ চাল ৫ ১০০"');
      return;
    }

    const command = words[0]; // প্রথম শব্দ কমান্ড
    const rest = words.slice(1);

    if (command === 'যোগ' || command === 'add') {
      // প্রোডাক্ট যোগ করার চেষ্টা
      let name = '';
      let quantity = 1;
      let price = 0;

      if (rest.length === 1) {
        name = rest[0];
      } else if (rest.length >= 3) {
        name = rest[0];
        quantity = parseInt(rest[1]) || 1;
        price = parseFloat(rest[2]) || 0;
      } else {
        setCommandFeedback('দুঃখিত, সঠিক ফরম্যাটে বলুন: "যোগ চাল" অথবা "যোগ চাল ৫ ১০০"');
        return;
      }

      try {
        await addProduct(db, { name, quantity, price });
        setCommandFeedback(`✅ "${name}" প্রোডাক্টটি যোগ করা হয়েছে (পরিমাণ: ${quantity}, মূল্য: ৳${price})`);
        loadProducts(db); // লিস্ট রিলোড
      } catch (error) {
        setCommandFeedback('❌ প্রোডাক্ট যোগ করতে সমস্যা হয়েছে');
      }
    }
    else {
      setCommandFeedback('অজানা কমান্ড। বলুন "যোগ চাল" বা "যোগ চাল ৫ ১০০"');
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

        {commandFeedback ? (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedback}>{commandFeedback}</Text>
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
  feedbackContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e0ffe0',
    borderRadius: 5,
    width: '100%',
  },
  feedback: {
    textAlign: 'center',
    color: '#006600',
    fontWeight: '600',
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