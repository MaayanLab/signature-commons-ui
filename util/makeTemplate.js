export function makeTemplate(
  templateString,
  templateVariables
) {
  const keys = [...Object.keys(templateVariables).map((key) => key.replace(/ /g, '_')), 'PREFIX']
  const values = [...Object.values(templateVariables), process.env.PREFIX];
  let templateFunction = new Function(...keys, `return \`${templateString}\`;`);
  return templateFunction(...values);
}
