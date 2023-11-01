
export function copyStyles(sourceDoc, targetDoc) {
  const styleSheets = Array.from(sourceDoc.styleSheets).filter(
    (styleSheet) => !styleSheet.href || styleSheet.href.startsWith(window.location.origin)
  );
  for (let style of styleSheets) {
    if (style instanceof CSSStyleSheet && style.cssRules) {
            // true for inline styles
        const newStyleEl = sourceDoc.createElement("style");
  
        Array.from(style.cssRules).forEach(cssRule => {
          newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
        });
        targetDoc.head.appendChild(newStyleEl);
    }else{
          // true for stylesheets loaded from a URL
      const newLinkEl = sourceDoc.createElement("link");

      newLinkEl.rel = "stylesheet";
      newLinkEl.href = style.href;
      targetDoc.head.appendChild(newLinkEl);
    }
  }

    // Array.from(sourceDoc.styleSheets).forEach(styleSheet => {
    //   if (styleSheet.cssRules) {
    //     // true for inline styles
    //     const newStyleEl = sourceDoc.createElement("style");
  
    //     Array.from(styleSheet.cssRules).forEach(cssRule => {
    //       newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
    //     });
  
    //     targetDoc.head.appendChild(newStyleEl);
    //   } else if (styleSheet.href) {
    //     // true for stylesheets loaded from a URL
    //     const newLinkEl = sourceDoc.createElement("link");
  
    //     newLinkEl.rel = "stylesheet";
    //     newLinkEl.href = styleSheet.href;
    //     targetDoc.head.appendChild(newLinkEl);
    //   }
    // });
  }
  