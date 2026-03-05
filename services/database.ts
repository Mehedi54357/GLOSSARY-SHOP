import * as SQLite from 'expo-sqlite';
import { DialectMapping, Product } from '../types/product';

export const openDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('glossaryShop.db');
    return db;
  } catch (error) {
    console.error("ডাটাবেজ ওপেন করতে সমস্যা:", error);
    throw error;
  }
};

export const setupDatabase = async (db: SQLite.SQLiteDatabase) => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        dialectName TEXT,
        quantity INTEGER DEFAULT 0,
        price REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS dialect_mapping (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dialect_word TEXT NOT NULL UNIQUE,
        standard_word TEXT NOT NULL,
        district TEXT
      );
    `);
    console.log("টেবিল তৈরি করা হয়েছে");
    await insertDummyDialectData(db);
  } catch (error) {
    console.error("টেবিল তৈরি করতে সমস্যা:", error);
    throw error;
  }
};

const insertDummyDialectData = async (db: SQLite.SQLiteDatabase) => {
  const dummyData: DialectMapping[] = [
    { dialect_word: "বাইত", standard_word: "বাড়ি", district: "ময়মনসিংহ" },
    { dialect_word: "কুলা", standard_word: "ফ্যান", district: "ময়মনসিংহ" },
    { dialect_word: "হান্দি", standard_word: "চাল", district: "সিলেট" },
    { dialect_word: "জামা", standard_word: "কাপড়", district: "চট্টগ্রাম" },
    { dialect_word: "মরিচ", standard_word: "মরিচ", district: "ঢাকা" },
    { dialect_word: "ইলিশ", standard_word: "ইলিশ মাছ", district: "বরিশাল" },
    { dialect_word: "ঢেঁকি", standard_word: "ধান ভানার যন্ত্র", district: "কিশোরগঞ্জ" },
    { dialect_word: "নুন", standard_word: "লবণ", district: "খুলনা" },
    { dialect_word: "চান", standard_word: "চাঁদ", district: "রাজশাহী" },
    { dialect_word: "পান", standard_word: "পান পাতা", district: "কুষ্টিয়া" },
  ];
  for (const item of dummyData) {
    try {
      await db.runAsync(
        'INSERT OR IGNORE INTO dialect_mapping (dialect_word, standard_word, district) VALUES (?, ?, ?);',
        item.dialect_word,
        item.standard_word,
        item.district || null
      );
    } catch (error) {
      console.log("ডাটা ইন্সার্ট করতে সমস্যা:", error);
    }
  }
  console.log("ডামি ডায়ালেক্ট ডাটা যোগ করা হয়েছে");
};

export const addProduct = async (db: SQLite.SQLiteDatabase, product: Product) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO products (name, dialectName, quantity, price) VALUES (?, ?, ?, ?);',
      product.name,
      product.dialectName ?? null,
      product.quantity,
      product.price
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("প্রোডাক্ট যোগ করতে সমস্যা:", error);
    throw error;
  }
};

export const getAllProducts = async (db: SQLite.SQLiteDatabase): Promise<Product[]> => {
  try {
    const allRows = await db.getAllAsync('SELECT * FROM products ORDER BY created_at DESC;');
    return allRows as Product[];
  } catch (error) {
    console.error("প্রোডাক্ট আনতে সমস্যা:", error);
    return [];
  }
};

export const updateProduct = async (db: SQLite.SQLiteDatabase, id: number, product: Partial<Product>) => {
  try {
    const fields = [];
    const values = [];
    if (product.name !== undefined) {
      fields.push('name = ?');
      values.push(product.name);
    }
    if (product.dialectName !== undefined) {
      fields.push('dialectName = ?');
      values.push(product.dialectName);
    }
    if (product.quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(product.quantity);
    }
    if (product.price !== undefined) {
      fields.push('price = ?');
      values.push(product.price);
    }
    if (fields.length === 0) return;
    values.push(id);
    await db.runAsync(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?;`,
      ...values
    );
  } catch (error) {
    console.error("প্রোডাক্ট আপডেট করতে সমস্যা:", error);
    throw error;
  }
};

export const deleteProduct = async (db: SQLite.SQLiteDatabase, id: number) => {
  try {
    await db.runAsync('DELETE FROM products WHERE id = ?;', id);
  } catch (error) {
    console.error("প্রোডাক্ট ডিলিট করতে সমস্যা:", error);
    throw error;
  }
};

export const convertDialectToStandard = async (db: SQLite.SQLiteDatabase, dialectText: string): Promise<string> => {
  try {
    const words = dialectText.split(' ');
    let convertedWords = [];
    for (const word of words) {
      const result = await db.getFirstAsync<{standard_word: string}>(
        'SELECT standard_word FROM dialect_mapping WHERE dialect_word = ?;',
        word
      );
      if (result) {
        convertedWords.push(result.standard_word);
      } else {
        convertedWords.push(word);
      }
    }
    return convertedWords.join(' ');
  } catch (error) {
    console.error("কনভার্শনে সমস্যা:", error);
    return dialectText;
  }
};

export { Product };

export const addProductByVoice = async (
  db: SQLite.SQLiteDatabase,
  voiceText: string
) => {
  try {

    const words = voiceText.trim().split(" ");

    if (words.length < 2) return;

    const command = words[0];
    const productName = words[1];

    if (command === "যোগ") {

      await db.runAsync(
        'INSERT INTO products (name, quantity, price) VALUES (?, ?, ?);',
        productName,
        1,
        0
      );

      console.log("Voice দিয়ে product add হয়েছে:", productName);

    }

  } catch (error) {
    console.error("Voice product add করতে সমস্যা:", error);
  }
};