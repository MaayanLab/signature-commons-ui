import {getName} from '../../util/ui/labelGenerator'
import {makeTemplate} from '../../util/ui/makeTemplate'
import colormap from 'colormap'

export const process_data = async ({entries,
		schemas,
		serialized=false,
		library,
		primary_color,
		secondary_color,
		secondary_field=[
			{
				label: "Cell Line",
				text: "${meta.cellline}",
				field: "meta.cellline"
			}
		]}) => {
	const inactive_color="#c9c9c9"
	const direction_color = {
		up: primary_color,
		reversers: primary_color,
		down: secondary_color,
		mimickers: secondary_color,
		ambiguous: inactive_color,
		"-":inactive_color,
	}
	const scatter_data = []
	const colorize = {}
	for (const entry of Object.values(entries)){
		let e
		if (serialized){
			e = entry
		} else {
			e = await entry.entry()
			e.library = library
		}
		// scatter
		const direction = e.direction
		// let color = inactive_color
		// if (direction === undefined || ["up", "reversers"].indexOf(direction) > -1 || direction === "signatures") {
		// 	color = primary_color
		// }else if (direction !== "ambiguous"){
		// 	color = secondary_color
		// }
		const name = getName(e, schemas)
		const category = {}
		for (const f of secondary_field){
			if (colorize[f.label] === undefined) colorize[f.label] = {}
			const text = makeTemplate(f.text, e)
			category[f.label] = text
			colorize[f.label][text] = null
		}
		if (e.library.dataset_type === "geneset_library"){ 
			if (colorize.significance === undefined) colorize.significance = {
				significant: primary_color,
				insignificant: inactive_color,
			}
			category.significance = e.scores["p-value"] < 0.05 ? "significant": "insignificant"
			scatter_data.push({
				name: name,
				yAxis: e.scores["odds ratio"],
				yName: "odds ratio",
				xAxis: -Math.log(e.scores["p-value"]),
				xName: "-lop p",
				value: e.scores["p-value"],
				actual_value: e.scores[this.state.order_field],
				// color: e.scores["p-value"] < 0.05 ? color: inactive_color,
				category,
				id: e.id,
				direction,
				...e.scores,
			})
		}else if (e.library.dataset_type === "rank_matrix"){ 
			category.direction = direction
			if (colorize.direction === undefined) colorize.direction = {}
			if (colorize.direction[direction] === undefined) colorize.direction[direction] = direction_color[direction] 
			scatter_data.push({
				name: name,
				yAxis: e.scores["z-score (up)"],
				xAxis: e.scores["z-score (down)"],
				yName: 'z-score (up)',
				xName: 'z-score (down)',
				// color,
				category,
				id: e.id,
				direction,
				...e.scores,
			})
		}	
	}
	for (const [k,v] of Object.entries(colorize)){
		if (["direction", "significance"].indexOf(k)<0){
			const keys = Object.keys(v)
			const colors = colormap({
				colormap: 'rainbow-soft',
				nshades: keys.length > 11 ? keys.length: 11,
				format: 'hex',
				alpha: 1
			})
			for (const i in keys){
				const key = keys[i]
				colorize[k][key] = colors[i]
			}
		}
	}
	return {scatter_data, colorize}
}