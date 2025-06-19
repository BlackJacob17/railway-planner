const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/railway_planner';

async function listIndexes() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db();
        const collection = db.collection('bookings');
        
        console.log('Current indexes in the bookings collection:');
        const indexes = await collection.listIndexes().toArray();
        
        if (indexes.length === 0) {
            console.log('No indexes found');
            return;
        }
        
        console.log('\nIndexes:');
        console.log('--------');
        
        indexes.forEach((index, i) => {
            console.log(`\n${i + 1}. Index name: ${index.name}`);
            console.log(`   Key: ${JSON.stringify(index.key)}`);
            if (index.unique) console.log('   Unique: true');
            if (index.sparse) console.log('   Sparse: true');
            if (index.partialFilterExpression) {
                console.log('   Partial Filter:', JSON.stringify(index.partialFilterExpression, null, 2));
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('\nConnection closed');
        process.exit(0);
    }
}

listIndexes();
