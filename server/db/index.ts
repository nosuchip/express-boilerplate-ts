import config from '@server/config';
import mongoose, { Mongoose } from 'mongoose';

class Database {
    private db: Mongoose | null = null;

    async initialize() {
        const options = {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        };

        this.db = await mongoose.connect(config.databaseUri, options);

        // if (config.debug) {
        //     mongoose.set('debug', (collectionName, method, query, doc) => {
        //         logger.debug(`${collectionName}.${method}( ${JSON.stringify(query)} ) = ${JSON.stringify(doc)}`);
        //     });
        // }
    }

    async shutdown() {
        if (this.db) {
            this.db.connection.close();
            this.db = null;
        }
    }
}

export default new Database();
