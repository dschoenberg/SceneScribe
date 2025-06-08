/* global process */
import dotenv from "dotenv";
import axios from "axios";
import fetch from "node-fetch";
import fs from "fs-extra";
import path from "path";
import { Buffer } from "buffer";
import { OpenAI } from "openai";
import hardcoverQuery from "./hardcoverQuery.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { global} from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const openai = new OpenAI({
  apiKey: global.process.env.OPENAI_API_KEY,
});

const HARDCOVER_API_URL = "https://api.hardcover.app/v1/graphql";

async function getBooksFromGraphQL() {
  try {
    const response = await axios.post(
      HARDCOVER_API_URL,
      { query: hardcoverQuery },
      {
        headers: {
          Authorization: `Bearer ${process.env.HARDCOVER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const allBooks = response.data.data.me[0].user_books;
    return allBooks;
  } catch (error) {
    console.error("Error fetching books from Hardcover:", error.message);
    return [];
  }
}

function pickRandomBook(books) {
  return books[Math.floor(Math.random() * books.length)];
}

async function generateScene(book) {
  const prompt = `From the book "${
    book.book.title
  }" by ${book.book.contributions
    .map((a) => a.name)
    .join(
      ", "
    )}, describe a vivid scene or introduce a memorable character without spoilers. Focus on tone, mood, and visual detail.`;

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    return chat.choices[0].message.content;
  } catch (error) {
    console.error("Error generating content from OpenAI:", error.message);
    return null;
  }
}

async function generateImageFromDescription(description) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3", // You can use "dall-e-2" if needed
      prompt: description,
      n: 1,
      size: "1024x1024", // You can change to "512x512" or "1792x1024"
      quality: "standard",
      style: "vivid", // or "natural"
    });

    const imageUrl = response.data[0].url;
    return imageUrl;
  } catch (error) {
    console.error("Error generating image from OpenAI:", error.message);
    return null;
  }
}

async function saveImageToFile(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const outputDir = path.join(__dirname, "images");
    await fs.ensureDir(outputDir);

    const filePath = path.join(outputDir, filename);
    await fs.writeFile(filePath, buffer);

    console.log(`Image saved to ${filePath}`);
  } catch (error) {
    console.error("Failed to save image:", error.message);
  }
}

async function run() {
  console.log("Fetching your book list...");
  const books = await getBooksFromGraphQL();

  if (!books.length) {
    console.log("No books found.");
    return;
  }

  const book = pickRandomBook(books);
  console.log(book);
  const title = book.book.title;
  console.log(
    `Selected: "${title}" by ${book.book.contributions
      .map((a) => a.author.name)
      .join(", ")}`
  );

  const description = await generateScene(book);

  console.log("\nGenerated Scene or Character Description:\n");
  console.log(description);

  const imageUrl = await generateImageFromDescription(description);

  if (imageUrl) {
    console.log("\nGenerated Image URL:\n");
    console.log(imageUrl);

    
      // Sanitize title for filename
      const safeTitle = title.replace(/[^\w\d_-]+/g, "_").toLowerCase();

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `${safeTitle}_${timestamp}.jpg`;
      await saveImageToFile(imageUrl, filename);
  }
}

run();
