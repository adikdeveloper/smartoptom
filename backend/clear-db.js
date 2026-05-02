const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://smartoptom:optom2026%21@ac-9ubpnyk-shard-00-00.lmd7arq.mongodb.net:27017,ac-9ubpnyk-shard-00-01.lmd7arq.mongodb.net:27017,ac-9ubpnyk-shard-00-02.lmd7arq.mongodb.net:27017/water-crm?ssl=true&replicaSet=atlas-iuirq7-shard-0&authSource=admin&retryWrites=true&w=majority';

async function clearAllCollections() {
  try {
    console.log('🔌 MongoDB ga ulanmoqda...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Ulandi!');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('📭 Hech qanday kolleksiya topilmadi.');
    } else {
      console.log(`\n🗑️  ${collections.length} ta kolleksiya topildi. O'chirish boshlanmoqda...\n`);
      for (const col of collections) {
        const result = await db.collection(col.name).deleteMany({});
        console.log(`  ✅ ${col.name}: ${result.deletedCount} ta yozuv o'chirildi`);
      }
      console.log('\n🎉 Barcha ma\'lumotlar muvaffaqiyatli o\'chirildi!');
    }
  } catch (err) {
    console.error('❌ Xato:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB ulanish yopildi.');
  }
}

clearAllCollections();
