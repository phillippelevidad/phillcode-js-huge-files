const fs = require("fs");
const { Readable, Transform } = require("stream");

const SEED_PATH = "./seed.txt";
const OUT_PATH = "./big-file.txt";

async function main() {
  await generateFile();
  countFileWords();
}

function generateFile() {
  return new Promise((resolve) => {
    const seed = fs.readFileSync(SEED_PATH, "utf8");
    const targetSize = Math.pow(1024, 3);
    const repetitions = Math.ceil(targetSize / seed.length);

    console.time("generating file");
    const generate = new Readable({
      read() {
        for (let i = 0; i < repetitions; i++) {
          this.push(seed);
        }
        this.push(null);
      },
    });

    const outFile = fs.createWriteStream(OUT_PATH);

    generate.pipe(outFile);
    generate.on("end", () => {
      console.timeEnd("generating file");
      resolve();
    });
  });
}

function countFileWords() {
  console.time("counting words");
  const bigFile = fs.createReadStream(OUT_PATH);

  const countWords = new Transform({
    transform(chunk, encoding, callback) {
      const words = chunk.toString().split(" ");
      this.wordCount = (this.wordCount ?? 0) + words.length;
      callback();
    },
    flush(callback) {
      this.push(this.wordCount.toString());
      callback();
    },
  });

  bigFile.pipe(countWords).pipe(process.stdout);
  countWords.on("end", () => {
    console.timeEnd("counting words");
  });
}

main();
