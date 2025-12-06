import React, { useState } from 'react';
import { htmlToText } from 'html-to-text';
import { pipeline, env  } from '@xenova/transformers';

// env.localModelPath = '/models/'; // ✅ set this first 
env.allowLocalModels = false;   

export default function Test() {
  const [summary, setSummary] = useState('');
  const [embedding, setEmbedding] = useState([]);

  const htmlContent = `<h1 class="text-4xl font-bold my-6 text-gray-800 text-center">
          📘 OnDoc User Guide
        </h1><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Your Knowledge Base SaaS Companion
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          👋 Welcome to OnDoc
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          <b>OnDoc</b> is a cloud-based knowledge base platform that helps teams, companies, and communities document what matters — and turn that into a smart, searchable source of truth.
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          With <b>OnDoc</b>, you can:
        </p><ul class="list-disc pl-6 my-4 text-left">
              <li class="items-center space-x-2">
                <span class="text-gray-700">Create <b>Projects</b> for different teams or purposes
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Write structured <b>Knowledge Pages</b> inside each project
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Use powerful editing tools with real-time collaboration
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Enable an <b>AI Chatbot</b> to instantly answer questions from your documentation</span>
              </li></ul><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          🧭 Quick Overview
        </h2><div class="overflow-x-auto my-4 text-left"><table class="min-w-full border border-gray-300 text-left text-sm"><tr><th class="border px-4 py-2">Term</th><th class="border px-4 py-2">Meaning</th></tr><tr><td class="border px-4 py-2">Project</td><td class="border px-4 py-2">A workspace for your documentation (e.g., "HR Docs", "Support KB")</td></tr><tr><td class="border px-4 py-2">Knowledge Page</td><td class="border px-4 py-2">A single document inside a project</td></tr><tr><td class="border px-4 py-2">AI Chatbot</td><td class="border px-4 py-2">Smart assistant trained on your pages</td></tr></table></div><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          🚀 Getting Started
        </h2><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          1. Create a Project
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Projects help you organize your documentation by topic or department.
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          🛠 Steps:
        </p><ul class="list-disc pl-6 my-4 text-left">
              <li class="items-center space-x-2">
                <span class="text-gray-700">Go to your <b>Dashboard</b>
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Click “<b>+ New Project</b>”
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Name your project (e.g., “HR Handbook”, “Product Support”)
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Click <b>Create</b></span>
              </li></ul><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          2. Create a Knowledge Page
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Inside each project, you can add unlimited knowledge pages.
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          🛠 Steps:
        </p><ul class="list-disc pl-6 my-4 text-left">
              <li class="items-center space-x-2">
                <span class="text-gray-700">Open your project
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Click “<b>+ New Knowledge Page</b>”
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Start typing or use '/' to open the tools menu
</span>
              </li></ul><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          📌 Example:
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Project: “HR Handbook”
Knowledge Page: “How to Apply for Leave”
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          🧰 Tools You Can Use (With Examples)
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Here are the built-in tools in the editor and how to use them inside your knowledge pages.
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          📝 Paragraph (Default Text)
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Use for normal writing.
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          📌 Example:
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Welcome to the HR handbook. This guide covers all policies related to leave, benefits, and conduct.
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          🧷 Heading
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Add section titles to structure your content.
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          📌 Example:
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          sample heading
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          🛠 Command: /heading
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          ✅ Checklist
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Great for process or onboarding steps.
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          📌 Example:
        </p><ul class="space-y-2 my-4 text-left">
              <li class="flex items-center space-x-2">
                <input type="checkbox"  disabled class="accent-blue-500 cursor-default" />
                <span class="text-gray-700">Fill out leave form</span>
              </li>
              <li class="flex items-center space-x-2">
                <input type="checkbox"  disabled class="accent-blue-500 cursor-default" />
                <span class="text-gray-700">Get approval</span>
              </li>
              <li class="flex items-center space-x-2">
                <input type="checkbox"  disabled class="accent-blue-500 cursor-default" />
                <span class="text-gray-700">Update your calendar</span>
              </li></ul><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          🛠 Command: /checklist
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          🔢 List (Bullet or Numbered)
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Useful for steps, policies, or quick points.
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          📌 Example:
        </p><ol class="list-decimal pl-6 my-4 text-left">
              <li class="items-center space-x-2">
                <span class="text-gray-700">Login to your account
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Navigate to ‘Leave’
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Click ‘Apply’
</span>
              </li></ol><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          🛠 Command: /Ordered List or /Unordered list
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          💬 Quote
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Highlight important notes or key phrases.
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          📌 Example:
        </p>
          <blockquote class="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700 text-left">
            <p>Leave must be applied at least 3 days in advance.</p>
            <footer class="text-sm text-gray-500 mt-2">— &nbsp; HR Team</footer>
          </blockquote>
        <p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          🛠 Command: /quote
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          💻 Code Block
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Ideal for developer docs, API references, or setup scripts.
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          📌 Example:
        </p>
          <div class="relative my-6 bg-gray-900 rounded-lg text-green-200 text-left">
            <button 
                id="copy-btn-4nu1uz0d3"
                onclick="
                    navigator.clipboard.writeText(document.getElementById('code-block-4nu1uz0d3').innerText).then(() => {
                        const btn = document.getElementById('copy-btn-4nu1uz0d3');
                        const original = btn.innerText;
                        btn.innerText = 'Copied!';
                        btn.classList.add('bg-green-600');
                        setTimeout(() => {
                            btn.innerText = original;
                            btn.classList.remove('bg-green-600');
                        }, 1200);
                    });
                " 
                class="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700 transition"
                title="Copy code"
            >
              Copy
            </button>
            <pre class="p-4 overflow-x-auto text-sm"><code id="code-block-4nu1uz0d3" class="font-mono">#include&lt;stdio.h&gt;

int main() 
  {
    printf("!Hi World");
    return 0;
  }</code></pre>
          </div>
        <p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          🛠 Command: /code
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          📊 Table
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Display data clearly.
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          📌 Example:
        </p><div class="overflow-x-auto my-4 text-left"><table class="min-w-full border border-gray-300 text-left text-sm"><tr><th class="border px-4 py-2">Type</th><th class="border px-4 py-2">Days</th><th class="border px-4 py-2">Approval Required</th></tr><tr><td class="border px-4 py-2">Sick Leave</td><td class="border px-4 py-2">10</td><td class="border px-4 py-2">No</td></tr><tr><td class="border px-4 py-2">Annual</td><td class="border px-4 py-2"><i>20</i></td><td class="border px-4 py-2">Yes</td></tr></table></div><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          🛠 Command: /table
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          🖼️ Media
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Upload diagrams, screenshots, or graphics.
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          🛠 Steps:
        </p><ul class="list-disc pl-6 my-4 text-left">
              <li class="items-center space-x-2">
                <span class="text-gray-700">Type /media or click the media tool
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Upload a file from your device
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">It will appear inline in the doc</span>
              </li></ul><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          📌 Example: image/video
        </p>
            <figure class="my-6 text-center">
              <img 
                src="https://www.dictionary.com/e/wp-content/uploads/2020/01/WisdomvsKnowledge_1000x700_jpg_OHVUvmTo.jpg" 
                alt="" 
                class="inline-block rounded shadow-md max-w-full h-auto"
              />
              <figcaption class="text-gray-500 mt-2 text-sm italic">
                Knowledge Base
              </figcaption>
            </figure>
          <p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          🛠 Command: /media
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          🎨 Color Picker
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Highlight key text using pre-defined brand-friendly colors.
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          📌 Example:
        </p><ul class="list-disc pl-6 my-4 text-left">
              <li class="items-center space-x-2">
                <span class="text-gray-700">🔴 <span style="color: rgb(255, 0, 0);">Red</span> — Errors or alerts
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">🟢 <span style="color: rgb(0, 128, 0);">Green</span> — Success or confirmation
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">🔵 <span style="color: rgb(0, 123, 255);">Blue</span> — Links or info
</span>
              </li></ul><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          🛠 Action: Select text → Color Picker Tool
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          ↔️ Alignment Tool
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          Align content to left, center, or right per block.
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          📌 Example:
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-center">
          Center-align a title

        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-right">
          Right-align a list for cleaner layout

        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          🛠 Action: Select block → Alignment Tool
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          🤖 AI Chatbot (Powered by Your Knowledge)
        </h2><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          OnDoc comes with a built-in AI assistant that reads your knowledge pages and gives users instant answers.
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          🔍 What It Can Do:
        </h2><ul class="list-disc pl-6 my-4 text-left">
              <li class="items-center space-x-2">
                <span class="text-gray-700">Understand user questions
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Search across all knowledge pages in a project
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Respond with answers based only on your content</span>
              </li></ul><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          🛠 How to Use It:
        </h2><ol class="list-decimal pl-6 my-4 text-left">
              <li class="items-center space-x-2">
                <span class="text-gray-700">Create and publish your knowledge pages
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">The AI chatbot automatically indexes them
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Users can ask questions in natural language
</span>
              </li></ol><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          📌 Example Questions:
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          ❓ “How do I reset my password?”
✅ “Go to the login page, click ‘Forgot Password’, and follow the steps.”
        </p><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          ❓ “How many sick leave days do I have?”
✅ “Employees are allowed up to 10 sick leave days per year.”
        </p><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          📂 Best Practices for Teams
        </h2><div class="overflow-x-auto my-4 text-left"><table class="min-w-full border border-gray-300 text-left text-sm"><tr><th class="border px-4 py-2">Goal</th><th class="border px-4 py-2">Strategy</th></tr><tr><td class="border px-4 py-2">Employee Onboarding</td><td class="border px-4 py-2">Use projects like “New Hire Guide” with pages for setup, benefits, and expectations</td></tr><tr><td class="border px-4 py-2">Customer Support</td><td class="border px-4 py-2">Create FAQ-style pages, group into a "Support" project</td></tr><tr><td class="border px-4 py-2">Technical Docs</td><td class="border px-4 py-2">Use code blocks, headings, and media uploads for clarity</td></tr></table></div><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          🛡️ Permissions (Optional/Planned)
        </h2><ul class="list-disc pl-6 my-4 text-left">
              <li class="items-center space-x-2">
                <span class="text-gray-700">Limit access by role (Viewer, Editor, Admin)
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Choose whether a project is public or private
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Share knowledge pages via URL</span>
              </li></ul><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          💰 Cost-Efficiency Benefits
        </h2><ul class="list-disc pl-6 my-4 text-left">
              <li class="items-center space-x-2">
                <span class="text-gray-700">✅ No servers to manage or maintain
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">✅ Replace expensive wikis, doc tools, and chatbots with one solution
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">✅ Scales with your team — from solo creator to enterprise</span>
              </li></ul><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          🛟 Need Help?
        </h2><ul class="list-disc pl-6 my-4 text-left">
              <li class="items-center space-x-2">
                <span class="text-gray-700">📩 Contact: [<a>support@ondoc.app</a>] (placeholder)
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">💬 In-app help chat
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">🧪 Suggest features directly in the dashboard</span>
              </li></ul><h2 class="text-3xl font-bold my-6 text-gray-800 text-left">
          ✅ Summary: How to Use OnDoc
        </h2><ol class="list-decimal pl-6 my-4 text-left">
              <li class="items-center space-x-2">
                <span class="text-gray-700">Create a project to group related content
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Create knowledge pages inside each project using rich tools
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Use / command to access writing blocks (text, images, tables, etc.)
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Publish your content for internal or external use
</span>
              </li>
              <li class="items-center space-x-2">
                <span class="text-gray-700">Let the AI chatbot answer questions from your documentation
</span>
              </li></ol><p class="text-base text-gray-700 leading-relaxed my-4 text-left">
          OnDoc is more than just documentation. It's your team’s collective brain — structured, searchable, and smart.
        </p>`

  const handleProcess = async () => {
    const text = htmlToText(htmlContent);
    console.log("Extracted Text:", text);

    const summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
    const summaryRes = await summarizer(text);
    const summaryText = summaryRes[0].summary_text;
    setSummary(summaryText);

    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const embeddingRes = await embedder(summaryText, {
      pooling: 'mean',
      normalize: true,
    });
    setEmbedding(embeddingRes);
  };

  return (
    <div>
      <button onClick={handleProcess}>Process Content</button>
      <h2>Summary:</h2>
      <p>{summary}</p>
      <h2>Embedding (Preview):</h2>
      <pre>{JSON.stringify(embedding.slice(0, 10), null, 2)} ...</pre>
    </div>
  );
}
