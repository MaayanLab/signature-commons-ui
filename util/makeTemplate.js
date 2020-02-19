export function makeTemplate(
    templateString,
    templateVariables
) {
  const keys = [...Object.keys(templateVariables).map((key) => key.replace(/ /g, '_')), 'PREFIX']
  const values = [...Object.values(templateVariables), process.env.PREFIX]
  let templateFunction = new Function(...keys, `return \`${templateString}\`;`)
  try {
    return templateFunction(...values)
  } catch (error) {
    return 'undefined'
  }
}

export function makeTemplateForObject(
  templateString,
  templateVariables,
  templateSubfield = null
) {
  const extracted_str = makeTemplate(templateString, templateVariables)
  if (extracted_str === 'undefined') return extracted_str
  try {
    const extracted = JSON.parse(extracted_str)
    let result = 'undefined'
    if (typeof extracted === 'object'){
      if (Array.isArray(extracted)) {
        result = []
        for (const e of extracted){
          if (templateSubfield!==null && typeof e === 'object') {
            result = [...result, makeTemplate(templateSubfield, e)]
          } else if (typeof e === "string"){
            result = [...result, e]
          }
        }
        return result
      } else {
        return makeTemplate(templateSubfield, extracted)
      }
    }
    return result
  }catch (error) {
    console.error(error)
    return 'undefined'
  }
}