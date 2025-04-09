const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { InferenceClient } = require("@huggingface/inference");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

app.post("/analyze", async (req, res) => {
    const { code } = req.body;

    const prompt = `
        You are a JavaScript code review assistant. Analyze the following code, detect errors, and suggest improvements.  
    Provide feedback **only in a structured format** as follows:  

    **Errors & Issues:**  
    1. [List the errors concisely]  
    2. [Keep points brief and to the point]  

    **Improved Code:**  
    \`\`\`javascript
    // Provide the corrected code here
    \`\`\`

    **Improvements:**  
    ✅ [List key improvements]  
    ✅ [Keep it concise]  

    Do **not** include explanations, reasoning, or unnecessary text.  
    Do **not** wrap your response in <think> tags.  

    Here is the code to analyze:  
    \`\`\`javascript
    ${code}
    \`\`\`
    `;

    try {
        const output = await hf.chatCompletion({
            model: "deepseek-ai/DeepSeek-V3-0324",
            messages: [{ role: "user", content: prompt }],
            provider: "fireworks-ai",
            max_tokens: 200,
        });

        res.json({ ai_feedback: output.choices[0]?.message?.content || "No response from AI" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ai_feedback: "Error fetching AI suggestions" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));