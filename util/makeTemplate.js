export function makeTemplate(
  templateString,
  templateVariables
) {
  const keys = Object.keys(templateVariables).map((key) => key.replace(/ /g, '_')).concat('process')
  const values = Object.values(templateVariables).concat(process);
  let templateFunction = new Function(...keys, `return \`${templateString}\`;`);
  return templateFunction(...values);
}
