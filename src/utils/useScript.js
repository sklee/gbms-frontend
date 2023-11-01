import { useEffect } from 'react';

let cachedScripts = {};
export function useScript(scripts) {
  const onScriptLoad = (src, loaded) => () => {
    cachedScripts[src].loaded = true;
    if (loaded) {
      loaded();
    }
  };

  const onScriptError = src => () => {
    delete cachedScripts[src];
  };

  useEffect(() => {
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].unLoad) {
        continue;
      }
      let src = scripts[i].src;

      let scriptLoader = cachedScripts[src];
      if (scriptLoader) {
        if (!scriptLoader.loaded) {
          let script = scriptLoader.script;
          script.addEventListener('load', onScriptLoad(src, scripts[i].loaded));
          script.addEventListener('error', onScriptError(src));
        }
      } else {
        // Create script
        let script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.defer = false;

        // Script event listener callbacks for load and error

        script.addEventListener('load', onScriptLoad(src, scripts[i].loaded));
        script.addEventListener('error', onScriptError(src));

        // Add script to document body
        document.body.appendChild(script);

        cachedScripts[src] = { loaded: false, script };
      }
    }

    return () => {
      for (const src in cachedScripts) {
        if (cachedScripts[src]) {
          const script = cachedScripts[src].srcipt;
          if (script) {
            script.removeEventListener('load', onScriptLoad(src));
            script.removeEventListener('error', onScriptError(src));
          }
        }
      }
    };
  }, [scripts]);
}
