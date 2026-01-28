const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('prisma/blog.db');

db.serialize(() => {
    db.run("DELETE FROM _prisma_migrations WHERE migration_name = '20260128173000_make_username_optional'", function (err) {
        if (err) {
            console.error(err.message);
            process.exit(1);
        }
        console.log(`Row(s) deleted: ${this.changes}`);
    });
});

db.close();
