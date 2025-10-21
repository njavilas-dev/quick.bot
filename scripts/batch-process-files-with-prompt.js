const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const axios = require('axios');

const OPENAI_API_KEY = 'sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; //NOSONAR

const promptTemplate = `
You are a Playwright test refactoring specialist. Transform the following test code to match this pattern:

\`\`\`typescript
test.describe("Feature > Component", () => {
  test("Should do something specific", async () => {
    await test.step("Step description 1", async () => {
      // implementation
    });
    
    await test.step("Step description 2", async () => {
      // implementation
    });
    
    await test.step("Step description 3", async () => {
      // implementation
    });
  });
});
\`\`\`

Key requirements:
1. Use "Feature > Component" format for test.describe names
2. Begin test names with "Should..."
3. Make sure all test.step calls end with semicolons
4. Keep all existing functionality exactly the same

File path: {{FILE_PATH}}
Based on this path, determine the appropriate Feature and Component names.

Here's the test file to refactor:

\`\`\`typescript
{{TEST_CODE}}
\`\`\`

Return only the full refactored TypeScript code without any explanations.
`;

async function callOpenAI(prompt) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1, // Low temperature for consistent, deterministic responses
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response?.data || error.message);
    throw error;
  }
}

async function processFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);

    // Read the original file content
    const fileContent = await readFileAsync(filePath, 'utf8');

    // Prepare the prompt with the file content and path
    const prompt = promptTemplate
      .replace('{{FILE_PATH}}', filePath)
      .replace('{{TEST_CODE}}', fileContent);

    // Call OpenAI API
    const refactoredCode = await callOpenAI(prompt);

    // Make a backup of the original file
    const backupFilePath = filePath + '.backup';
    await writeFileAsync(backupFilePath, fileContent);
    console.log(`Created backup at: ${backupFilePath}`);

    // Replace the original file with the refactored code
    await writeFileAsync(filePath, refactoredCode);

    console.log(`✅ Updated file: ${filePath}`);

    return { filePath, success: true };
  } catch (error) {
    console.error(`❌ Failed to process ${filePath}:`, error.message);
    return { filePath, success: false, error: error.message };
  }
}

async function main() {
  try {
    // Read the list of test files
    const fileListContent = await readFileAsync('scripts/batch-process-files-with-prompt.txt', 'utf8');
    const testFiles = fileListContent.split('\n').filter(line => line.trim() !== '');

    console.log(`Found ${testFiles.length} test files to process.`);

    // Process files sequentially to avoid rate limits
    const results = [];
    for (const file of testFiles) {
      try {
        // Skip files that have a backup version
        const backupFilePath = file + '.backup';
        if (fs.existsSync(backupFilePath)) {
          console.log(`Skipping ${file} - backup file exists`);
          results.push({ filePath: file, success: true, skipped: true });
          continue;
        }

        // Add a small delay between API calls to avoid rate limits
        if (results.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const result = await processFile(file);
        results.push(result);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        results.push({ filePath: file, success: false, error: error.message });
      }
    }

    // Write summary report
    const successCount = results.filter(r => r.success).length;
    const skippedCount = results.filter(r => r.skipped).length;
    const failureCount = results.length - successCount;

    console.log('\n========== SUMMARY ==========');
    console.log(`Total files: ${results.length}`);
    console.log(`Successful: ${successCount - skippedCount}`);
    console.log(`Skipped (already have backup): ${skippedCount}`);
    console.log(`Failed: ${failureCount}`);

    if (failureCount > 0) {
      console.log('\nFailed files:');
      results
        .filter(r => !r.success)
        .forEach(r => console.log(`- ${r.filePath}`));
    }

    // Save detailed report to file
    const reportContent = JSON.stringify(results, null, 2);
    await writeFileAsync('refactoring_report.json', reportContent);
    console.log('\nDetailed report saved to: refactoring_report.json');

  } catch (error) {
    console.error('Error in main process:', error);
  }
}

// Check if axios is installed
try {
  require.resolve('axios');
  console.log('Starting test refactoring process...');
  main();
} catch (error) {
  console.error('This script requires axios. Please install it using:');
  console.error('npm install axios');
  console.error('or');
  console.error('yarn add axios');
}