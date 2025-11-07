// @ts-check

if (!document.body.dataset.paths) throw new Error("<body> [data-paths] is missing");

// adding events
Object.entries(JSON.parse(document.body.dataset.paths)).forEach(async ([prefix, path]) => {
  const url          = "http://localhost:3000" + path;
  const module       = await import(url);
  const className    = Object.keys(module)[0];
  const DynamicClass = module[className];
  const elements     = document.querySelectorAll(`[data-prefix=${prefix}]`);
  if (elements.length == 0) console.warn(`${className} [data-prefix] is missing`);
  elements.forEach(element => {
    DynamicClass.handleEvents(element);
    console.log(`add ${className} events`);
  });
});

// adding global client variables
if (document.body.dataset.client_variables)
  globalThis.client_variables = JSON.parse(document.body.dataset.client_variables);

delete document.body.dataset.paths;
delete document.body.dataset.client_variables;
