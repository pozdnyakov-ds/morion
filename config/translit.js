const translit = (value) => {

	let converter = new Map([
		['а', 'a'], ['б', 'b'], ['в', 'v'], ['г', 'g'], ['д', 'd'],
		['е', 'e'], ['ё', 'e'], ['ж', 'zh'], ['з', 'z'], ['и', 'i'],
		['й', 'y'], ['к', 'k'], ['л', 'l'], ['м', 'm'], ['н', 'n'],
		['о', 'o'], ['п', 'p'], ['р', 'r'], ['с', 's'], ['т', 't'],
		['у', 'u'], ['ф', 'f'], ['х', 'h'], ['ц', 'c'], ['ч', 'ch'],
		['ш', 'sh'], ['щ', 'sch'], ['ь', ''], ['ы', 'y'], ['ъ', ''],
		['э', 'e'], ['ю', 'yu'], ['я', 'ya']
    ])

	value = value.replace(/ /g, "-") 
	value = value.toLowerCase()
    let res = ''
    for (let i = 0; i < value.length; i++) {
        let symbol = value.charAt(i)
        let newSymbol = (converter.get(symbol)) ? converter.get(symbol) : symbol
        res = res + newSymbol
    }
	return res;
}

export default translit