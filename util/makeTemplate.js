export function makeTemplate(
  templateString,
  templateVariables,
  templateSubfield=null
) {
  const keys = [...Object.keys(templateVariables).map((key) => key.replace(/ /g, '_')), 'PREFIX']
  const values = [...Object.values(templateVariables), process.env.PREFIX];
  let templateFunction = new Function(...keys, `return \`${templateString}\`;`);
  if(templateSubfield){
    if (templateFunction(...values)!== undefined){
      templateFunction = new Function(...keys, `return \`${templateSubfield}\`;`);
    }
  }
  return templateFunction(...values);
}
