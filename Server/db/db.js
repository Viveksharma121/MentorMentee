const mysql = require("mysql2");
const util = require("util");
const dotenv = require("dotenv");
const path = require("path");
const envPath = path.resolve(__dirname, "..", ".env");
const result = dotenv.config({ path: envPath });

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.query = util.promisify(pool.query);

const createTweet = `Create table if not exists tweets(
    id INT AUTO_INCREMENT Primary key,
    user_name varchar(20) default 'Vivek',
    content text,
    likes int default 0,
    created_at Timestamp default current_timestamp
  )`;

async function createTweetsTable() {
  try {
    await pool.query(createTweet);
    console.log("tweet table succesfully created");
  } catch (error) {
    console.log("error", error);
  } finally {
    pool.end();
  }
}

async function createTweets(id, user_name, content) {
  const result = await pool.query(
    `
    INSERT INTO tweets (id,user_name,content)
    VALUES (?,?,?)
    `,
    [id, user_name, content]
  );
  return result;
}

async function updateLikes(post) {
  try {
    const updateQuery = `UPDATE tweets 
    SET likes=?,
    userIdLists=?
    WHERE id=?
    `;
    const values = [post.likes, JSON.stringify(post.userIdLists), post.id];
    await pool.query(updateQuery, values);
    console.log("Post updated successfully");
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
}

async function getAllTweets() {
  const result = await pool.query("Select * from tweets");
  return result;
}

module.exports = {
  createTweets,
  getAllTweets,
  updateLikes,
};
