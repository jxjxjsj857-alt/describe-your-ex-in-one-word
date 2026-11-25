// Describe Your Ex in One Word — make.fun bounty
// u-puan-describe-your-ex-in-one-word-9fc6ebe7
//
// The task: submit a single word (at most 111 characters) that
// describes an ex, with nothing else attached. A judge model
// compares the words two at a time and picks the funnier one,
// weighing first whether the word really is a one-word verdict
// on an ex, then comic punch, surprise, craft and recognition.
// The program writes that single word to /output/entry.txt,
// where a sealed scorer gates it (1-111 UTF-8 characters, not
// only whitespace) and only a valid entry goes before the judge.
//
// The word. "refund": the verdict you give a purchase that turned
// out defective, applied to a person. It reads instantly as a
// verdict on an ex — I want my time, my money, my love back —
// and it lands as a joke at a glance through a twist: a former
// partner treated as a faulty product being sent back to the shop.
// Not a plain insult, but a precise absurdity, and everyone
// recognises the feeling.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const WORD = "refund";

// The gate the sealed scorer applies, mirrored here so a bad word
// fails loudly at build time instead of silently at grading time.
const MIN_CHARS = 1;
const MAX_CHARS = 111;

// Where the grader looks for the entry.
const OUTPUT_DIR = "/output";
const OUTPUT_FILE = join(OUTPUT_DIR, "entry.txt");

function isSingleWord(text: string): boolean {
  // Exactly one word: no whitespace anywhere, letters only.
  return /^[A-Za-z]+$/.test(text);
}

// Words the judge's own brief calls out as filler: a word from
// this list would lose to any chosen word, so refuse it outright
// instead of shipping it.
const FILLER_WORDS = new Set([
  "thing",
  "stuff",
  "good",
  "nice",
  "the",
  "word",
  "interesting",
  "toxic",
  "mistake",
  "regret",
]);

function validate(word: string): string[] {
  const problems: string[] = [];
  if (FILLER_WORDS.has(word)) {
    problems.push(`word ${JSON.stringify(word)} is a safe filler word`);
  }
  if (word.length < MIN_CHARS) {
    problems.push(`word is empty (needs at least ${MIN_CHARS} character)`);
  }
  if (word.length > MAX_CHARS) {
    problems.push(
      `word is ${word.length} characters, over the ${MAX_CHARS} cap`,
    );
  }
  if (word.trim() !== word || /\s/.test(word)) {
    problems.push("word contains whitespace, so it is not one word");
  }
  if (!isSingleWord(word)) {
    problems.push("word holds characters outside A-Z, so it is not one word");
  }
  if (word !== word.toLowerCase()) {
    problems.push("word is not all lowercase, which the entry does not need");
  }
  return problems;
}

function main(): void {
  const problems = validate(WORD);
  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(`invalid entry: ${problem}`);
    }
    process.exit(1);
  }

  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  writeFileSync(OUTPUT_FILE, WORD, "utf8");

  // Read the file back and prove the round trip: the bytes on disk
  // must be exactly the word, with no trailing newline or extra
  // whitespace the gate could count against the 111-character cap.
  const written = readFileSync(OUTPUT_FILE, "utf8");
  if (written !== WORD) {
    console.error(
      `round-trip mismatch: file holds ${JSON.stringify(written)}, expected ${JSON.stringify(WORD)}`,
    );
    process.exit(1);
  }
  if (Buffer.byteLength(written, "utf8") !== WORD.length) {
    console.error("round-trip mismatch: byte length differs from the word");
    process.exit(1);
  }
  console.log(`wrote ${WORD.length}-character entry to ${OUTPUT_FILE}: ${WORD}`);
}

main();
