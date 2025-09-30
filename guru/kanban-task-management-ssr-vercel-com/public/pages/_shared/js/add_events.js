// @ts-check

if (!document.body.dataset.paths) throw new Error("Missing <body> [data-paths]");
document.body.dataset.paths.split(";").forEach(async (path) => {
  const module       = await import(path);
  const className    = Object.keys(module)[0];
  const DynamicClass = module[className];
  document.querySelectorAll(DynamicClass.selector).forEach(element => {
    DynamicClass.handleEvents(element);
    console.log(`add ${className} events`);
  });
});
delete document.body.dataset.paths;
