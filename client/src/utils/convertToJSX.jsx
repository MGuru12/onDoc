import React, { useEffect, useState } from 'react'

const convertToJSX = ({editorData}) => {

  const [html, setHtml] = useState("");

 const convertDataToHtml = (blocks) => {
      let convertedHtml = "";
      blocks.map(block => {
        
        switch (block.type) {
          case "header":
            convertedHtml += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
            break;
          case "embded":
            convertedHtml += `<div><iframe width="560" height="315" src="${block.data.embed}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
            break;
          case "paragraph":
            convertedHtml += `<p>${block.data.text}</p>`;
            break;
          case "delimiter":
            convertedHtml += "<hr />";
            break;
          case "image":
            convertedHtml += `<img class="img-fluid" src="${block.data.file.url}" title="${block.data.caption}" /><br /><em>${block.data.caption}</em>`;
            break;
          case "list":
            if(block.data.style == "checklist") 
              {
                convertedHtml += `<input type="checkbox" ${block.data.items[0].meta.checked ? "checked='checked'" : ""} />`;
              }
            else if(block.data.style == "ordered") 
              {
                convertedHtml += "<ol>";
                block.data.items.forEach(function(li) {
                  convertedHtml += `<li>${li}</li>`;
                });
                convertedHtml += "</ol>";
              }
            else {
              convertedHtml += "<ul class='list-disc'>";
              block.data.items.forEach(function(li) {
                convertedHtml += `<li>${li}</li>`;
              });
              convertedHtml += "</ul>";
            }

            break;
          default:
            console.log("Unknown block type", block.type);
            break;
        }
      });
      return convertedHtml;
    } 
  
  useEffect(() => {
    console.log(editorData);
    // console.log();
    const blocks = JSON.parse(editorData).blocks;
    console.log(blocks);
    
    if(blocks) {
      setHtml(convertDataToHtml(blocks));
    }
    console.log(html);
    
  },[]); 

  return (
    <div>{html}112</div>
  )
}

export default convertToJSX;
