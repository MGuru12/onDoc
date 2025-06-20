import Paragraph from '@editorjs/paragraph';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table';
// import ImageTool from '@editorjs/image';
import ImageTool from '@pawritharya/editorjs-image-tool-delete';
// import Header from "editorjs-header-with-alignment";
import AlignmentTuneTool from "editorjs-text-alignment-blocktune";
import ColorPicker from 'editorjs-color-picker';
import CodeTool from '@editorjs/code';
import api from './Axios';
import MediaTool from '../editorjs_tools/MediaTool';


// Your Editor.js tools config
export const tools = {  
   ColorPicker: {
      class: ColorPicker,
      config: {
        colors: [
    "#000000",  // Black (primary text)
    "#FFFFFF",  // White (background)
    "#808080",  // Gray (secondary text)
    "#C0C0C0",  // Silver (light backgrounds)
    "#F5F5F5",  // Very light gray (backgrounds)
    "#333333",  // Dark gray (alternative text)
    "#666666",  // Medium gray (subtext)
    "#007BFF",  // Professional blue (links, accents)
    "#FF0000",  // Red (error, highlights)
    "#008000",  // Green (success)
    "#FFA500",  // Orange (warning)
    "#FFD700"   // Gold/yellow (highlight)
]
      },
    },
  paragraph: {
    class: Paragraph,
    inlineToolbar: true,
    tunes: ['anyTuneName'],
  },
  header: {
    class: Header,
    config: {
      placeholder: 'Enter a header',
      levels: [1, 2],
      defaultLevel: 2,
    },
    tunes: ['anyTuneName'],
  },
  code: {
    class: CodeTool,
    config: {
      placeholder: "Enter the code"
    }
  },
  list: {
    class: List,
    inlineToolbar: true,
  },
  checklist: {
    class: Checklist,
    inlineToolbar: true,
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
    config: {
      quotePlaceholder: 'Enter a quote',
      captionPlaceholder: 'Quote’s author',
    },
  },
  table: {
    class: Table,
    inlineToolbar: true,
    config: {
      rows: 2,
      cols: 3,
    },
  },
  image: {
      class: ImageTool,
      config: {
      uploader: {
        uploadByFile: async file => {
          const { data } = await uploadFile({ variables: { file } });

          return {
            success: 1,
            file: {
              url: data.fileUpload.uploadedFile.url
            }
          };
        }
      },
      deleter: {
        deleteFile: async url => {
          const { data } = await deleteFile({ variables: { url } });

          return { success: 1 };
        }
      }
    }
    },
  anyTuneName: {
    class:AlignmentTuneTool,
    config:{
      default: "left",
      blocks: {
        header: 'center',
        list: 'right'
      }
    },
  },
  media: {
      class: MediaTool,
      config: {
        // uploadEndpoint: 'http://localhost:3001/file/upload',
        // fileBaseUrl: 'http://localhost:3001/file/',
        // uploadEndpoint: process.env.VITE_CLOUDINARY_URL,
        // uploadPreset: process.env.VITE_CLOUDINARY_PRESET,
        // deleteEndpoint: `${process.env.VITE_API_URL}/file/delete`,
      }
    },
};

// Helper for indentation classes based on depth
function getMarginClass(depth) {
  // Tailwind supports ml-0, ml-4, ml-8, ml-12, ml-16, ml-20, ml-24, ml-28, ml-32
  const steps = [0, 4, 8, 12, 16, 20, 24, 28, 32];
  const margin = steps[Math.min(depth, steps.length - 1)];
  return `ml-${margin}`;
}

// Recursive function for nested lists with indentation
function renderList(items, style = "unordered", depth = 0) {
  if (!items || !items.length) return "";

  const isOrdered = style === "ordered";
  const tag = isOrdered ? "ol" : "ul";
  const listClass = `${isOrdered
    ? "list-decimal"
    : "list-disc"
    } list-inside my-4 text-gray-800 ${getMarginClass(depth)}`;

  let html = `<${tag} class="${listClass}">`;

  items.forEach((item) => {
    html += `<li class="mb-1">${item.content || ""}`;

    // Handle nested items
    if (item.items && item.items.length > 0) {
      html += renderList(item.items, style, depth + 1);
    }

    html += `</li>`;
  });

  html += `</${tag}>`;
  return html;
}

function getAlignmentClass(block) {
  // Safely get alignment from block.tunes
  const alignment = block.tunes?.anyTuneName?.alignment;
  switch (alignment) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    case "left":
      return "text-left";
    default:
      return "";
  }
}

export const convertToJsxString = (blocks) => {
  let convertedHtml = "";

  const getAlignmentClass = (block) => {
    const alignment = block?.data?.alignment || block?.tunes?.anyTuneName?.alignment;
    switch (alignment) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  const renderList = (items, style, depth = 0) => {
    const tag = style === "ordered" ? "ol" : "ul";
    let listHtml = `<${tag} class="pl-${depth * 4 + 4} my-3 space-y-1">`;

    items.forEach((item) => {
      if (typeof item === "string") {
        listHtml += `<li class="text-gray-800 leading-relaxed">${item}</li>`;
      } else {
        listHtml += `<li class="text-gray-800 leading-relaxed">${item.content}`;
        if (item.items) {
          listHtml += renderList(item.items, style, depth + 1);
        }
        listHtml += `</li>`;
      }
    });

    listHtml += `</${tag}>`;
    return listHtml;
  };

  blocks.forEach((block) => {
    const alignClass = getAlignmentClass(block);

    switch (block.type) {
      case "header":
        convertedHtml += `<h${block.data.level} class="text-${block.data.level === 1 ? '4xl' : block.data.level === 2 ? '3xl' : block.data.level === 3 ? '2xl' : 'xl'} font-bold my-6 text-gray-800 ${alignClass}">
          ${block.data.text}
        </h${block.data.level}>`;
        break;

      case "paragraph":
        convertedHtml += `<p class="text-base text-gray-700 leading-relaxed my-4 ${alignClass}">
          ${block.data.text}
        </p>`;
        break;

      case "delimiter":
        convertedHtml += `<hr class="my-6 border-t border-gray-300" />`;
        break;

      case "image":
        convertedHtml += `
          <div class="my-6 ${alignClass}">
            <img class="inline-block rounded-md shadow-md max-w-full h-auto" src="${block.data.file.url}" alt="${block.data.caption}" />
            <p class="text-sm text-gray-500 mt-2 italic">${block.data.caption}</p>
          </div>`;
        break;

      case "media":
        if (block.data.type === "image") {
          convertedHtml += `
            <figure class="my-6 text-center">
              <img 
                src="${block.data.url}" 
                alt="${block.data.fileName}" 
                class="inline-block rounded shadow-md max-w-full h-auto"
              />
              <figcaption class="text-gray-500 mt-2 text-sm italic">
                ${block.data.caption}
              </figcaption>
            </figure>
          `;
        } else if (block.data.type === "video") {
          convertedHtml += `
            <div class="my-6 ${alignClass}">
              <video 
                controls 
                class="rounded shadow-md max-w-full inline-block"
              >
                <source src="${block.data.url}" />
                Your browser does not support the video tag.
              </video>
            </div>
          `;
        }
        break;

      case "checklist":
        convertedHtml += `<ul class="space-y-2 my-4 ${alignClass}">`;
          block.data.items.forEach((item) => {
            convertedHtml += `
              <li class="flex items-center space-x-2">
                <input type="checkbox" ${item.checked ? "checked" : ""} disabled class="accent-blue-500 cursor-default" />
                <span class="text-gray-700">${item.text}</span>
              </li>`;
          });
          convertedHtml += `</ul>`;
        break;

      case "list":
        if (block.data.style === "unordered") {
          convertedHtml += `<ul class="list-disc pl-6 my-4 ${alignClass}">`;
          block.data.items.forEach((item) => {
            convertedHtml += `
              <li class="items-center space-x-2">
                <span class="text-gray-700">${item.content}</span>
              </li>`;
          });
          convertedHtml += `</ul>`;
          }
        else if (block.data.style === "ordered") {
          convertedHtml += `<ol class="list-decimal pl-6 my-4 ${alignClass}">`;
          block.data.items.forEach((item) => {
            convertedHtml += `
              <li class="items-center space-x-2">
                <span class="text-gray-700">${item.content}</span>
              </li>`;
          });
          convertedHtml += `</ol>`;
          }
         else {
          convertedHtml += `<div class="${alignClass}">` + renderList(block.data.items, block.data.style) + `</div>`;
        }
        break;

      case "quote":
        convertedHtml += `
          <blockquote class="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700 ${alignClass}">
            <p>${block.data.text}</p>
            <footer class="text-sm text-gray-500 mt-2">— ${block.data.caption || ""}</footer>
          </blockquote>
        `;
        break;

      case "table":
        if (block.data?.content && Array.isArray(block.data.content)) {
          convertedHtml += `<div class="overflow-x-auto my-4 ${alignClass}"><table class="min-w-full border border-gray-300 text-left text-sm">`;
          block.data.content.forEach((row, rowIndex) => {
            convertedHtml += `<tr>`;
            row.forEach((cell) => {
              const Tag = rowIndex === 0 ? "th" : "td";
              convertedHtml += `<${Tag} class="border px-4 py-2">${cell}</${Tag}>`;
            });
            convertedHtml += `</tr>`;
          });
          convertedHtml += `</table></div>`;
        }
        break;

      case "embded":
        convertedHtml += `
          <div class="my-6 ${alignClass}">
            <div class="aspect-w-16 aspect-h-9 inline-block w-full max-w-4xl">
              <iframe 
                src="${block.data.embed}" 
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                allowfullscreen 
                class="w-full h-full rounded-md shadow-md">
              </iframe>
            </div>
          </div>`;
        break;

      case "code":
        const escapedCode = block.data.code
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        const uniqueId = Math.random().toString(36).substr(2, 9);
        const codeId = `code-block-${uniqueId}`;
        const btnId = `copy-btn-${uniqueId}`;

        convertedHtml += `
          <div class="relative my-6 bg-gray-900 rounded-lg text-green-200 ${alignClass}">
            <button 
                id="${btnId}"
                onclick="
                    navigator.clipboard.writeText(document.getElementById('${codeId}').innerText).then(() => {
                        const btn = document.getElementById('${btnId}');
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
            <pre class="p-4 overflow-x-auto text-sm"><code id="${codeId}" class="font-mono">${escapedCode}</code></pre>
          </div>
        `;
        break;

      default:
        console.warn("Unknown block type:", block.type);
        break;
    }
  });

  return convertedHtml;
};
