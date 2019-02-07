export function makeTemplate(
  templateString,
  templateVariables
) {
  const keys = Object.keys(templateVariables).map((key) => key.replace(' ', '_'))
  const values = Object.values(templateVariables);
  let templateFunction = new Function(...keys, `return \`${templateString}\`;`);
  return templateFunction(...values);
}
