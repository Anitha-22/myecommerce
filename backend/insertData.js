const db = require('./config/db'); // Use your existing database connection
const categoriesData = require('./data/initialCategories');

/**
 * Script to insert initial category data into the MySQL table.
 */
function insertCategories() {
    console.log('Starting category data insertion...');

    const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    let insertionsCompleted = 0;

    categoriesData.forEach(category => {
        const values = [category.name, category.description];

        db.query(query, values, (err, result) => {
            if (err) {
                // If the error is due to a duplicate (e.g., trying to insert "Electronics" twice)
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`Skipping duplicate category: ${category.name}`);
                } else {
                    console.error(`Error inserting ${category.name}:`, err);
                }
            } else {
                console.log(`Successfully inserted category: ${category.name} (ID: ${result.insertId})`);
            }
            
            insertionsCompleted++;

            // Check if all insertions are done
            if (insertionsCompleted === categoriesData.length) {
                console.log('All category insertions processed. Closing database connection.');
                db.end(); // Close the connection after all tasks are done
            }
        });
    });
}

// Ensure the MySQL server is running before executing this script!
insertCategories();