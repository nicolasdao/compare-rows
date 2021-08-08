#!/usr/bin/env node

const program = require('commander')
const inquirer = require('inquirer')
const fs = require('fs')
const { resolve, basename, extname } = require('path')
const fileHelper = require('./src/fileHelper')
const { EOL } = require('os')
const { version } = require('./package.json')
program.version(version) // This is required is you wish to support the --version option.

const printSuccess = msg => console.log(`\x1b[1m\x1b[32m✔ ${msg}\x1b[0m`)
const printInfo = msg => console.log(`\x1b[1m\x1b[36mi ${msg}\x1b[0m`)
const printLog = msg => console.log(`\x1b[1m\x1b[37m ${msg}\x1b[0m`)
const printError = msg => console.log(`\x1b[1m\x1b[31mx ${msg}\x1b[0m`)

const fileNotFound = file => {
	printError(`File ${resolve(file)} not found`)	
	process.exit()
}

const missingArg = argName => {
	printError(`Missing required ${argName} argument`)	
	process.exit()
}

const transform = (lines, options) => {
	const { trim, ignorecase } = options || {}
	return trim || ignorecase 
		? lines.map(r => {
			let _r = trim ? r.trim() : r
			_r = ignorecase ? _r.toLowerCase() : _r
			return _r
		})
		: lines
}

const isSame = (row1, row2, options) => {
	if (options && options.contains)
		return row1 == row2 || row2.indexOf(row1) >= 0 || row1.indexOf(row2) >= 0
	else
		return row1 == row2
}

const selectFileDestination = async (resultName, defaultFile) => {
	let { dest } = await inquirer.prompt([{
		type: 'input',
		name: 'dest',
		message: `Enter file destination to save ${resultName} or press enter to select default (${defaultFile}):`,
	}])

	return resolve(dest || defaultFile)
}

/**
 * Compares rows in files. 
 * 
 * @return {Boolean} options.trim	
 * @return {Boolean} options.ignorecase	
 */
const main = async (file_01, file_02, options) => {
	if (!file_01) 
		missingArg('1st')
	if (!file_02) 
		missingArg('2nd')
	if (!(await fileHelper.exists(file_01)))
		fileNotFound(file_01)
	if (!(await fileHelper.exists(file_02)))
		fileNotFound(file_02)

	const lines_01 = (await fileHelper.read(file_01).catch(err => '') || '').toString().split(EOL).filter(x => x && x.trim())
	const lines_02 = (await fileHelper.read(file_02).catch(err => '') || '').toString().split(EOL).filter(x => x && x.trim())

	const _lines_01 = transform(lines_01, options)
	const _lines_02 = transform(lines_02, options)

	let { common, diff:diff02 } = _lines_02.reduce((acc,row) => {
		if (_lines_01.some(r => isSame(r, row, options)))
			acc.common.push(row)
		else
			acc.diff.push(row)
		return acc
	}, { common:[], diff:[] })
	let { diff:diff01 } = _lines_01.reduce((acc,row) => {
		if (_lines_02.some(r => isSame(r, row, options)))
			acc.common.push(row)
		else
			acc.diff.push(row)
		return acc
	}, { common:[], diff:[] })

	common = common.sort((a,b) => a < b ? -1 : 1)
	diff01 = diff01.sort((a,b) => a < b ? -1 : 1)
	diff02 = diff02.sort((a,b) => a < b ? -1 : 1)

	const l01 = lines_01.length
	const l02 = lines_02.length
	const f01 = resolve(file_01)
	const f02 = resolve(file_02)
	const commonCount = common.length
	const diff01Count = diff01.length
	const diff02Count = diff02.length

	printInfo(`${l01} line${l01 > 1 ? 's' : ''} found in ${f01}.`)
	printInfo(`${l02} line${l02 > 1 ? 's' : ''} found in ${f02}.`)
	console.log('')
	printSuccess(`RESULTS:`)
	printSuccess(`========`)
	printSuccess(`   - ${commonCount ? `${commonCount} common row${commonCount > 1 ? 's' :''}` : 'No common rows'} found.`)
	printSuccess(`   - ${diff01Count ? `${diff01Count} different row${diff01Count > 1 ? 's' : ''}` : 'No different rows'} found in ${f01}.`)
	printSuccess(`   - ${diff02Count ? `${diff02Count} different row${diff02Count > 1 ? 's' : ''}` : 'No different rows'} found in ${f02}.`)

	const { nextStep } = await inquirer.prompt([{
		type: 'list',
		name: 'nextStep',
		message: 'Choose an option: ',
		pageSize: 4,
		choices:[{
			name: 'Print results in this terminal',
			value: 'print'
		}, {
			name: 'Save results to files',
			value: 'save'
		}, {
			name: 'Abort',
			value: 'abort'
		}]
	}])

	if (nextStep == 'print') {
		printSuccess(`COMMON ROWS:`)
		console.log(common)
		console.log('')
		printSuccess(`DIFFERENT ROWS IN FILE ${f01}:`)
		console.log(diff01)
		console.log('')
		printSuccess(`DIFFERENT ROWS IN FILE ${f02}:`)
		console.log(diff02)
		console.log('')
	} else if (nextStep == 'save') {
		const commonDst = await selectFileDestination('the common rows', './common.json')
		const f01name = `diff-${basename(f01)}`
		const f01Ext = extname(f01)
		const dest01name = f01Ext ? f01name.replace(f01Ext, '.json') : f01name + '.json'
		const f01Dst = await selectFileDestination(`the different rows in ${f01name}`, `./${dest01name}`)
		const f02name = `diff-${basename(f02)}`
		const f02Ext = extname(f02)
		const dest02name = f02Ext ? f02name.replace(f02Ext, '.json') : f02name + '.json'
		const f02Dst = await selectFileDestination(`the different rows in ${f02name}`, `./${dest02name}`)	

		await fileHelper.write(commonDst, common)
		await fileHelper.write(f01Dst, diff01)
		await fileHelper.write(f02Dst, diff02)

		printSuccess(`The following 3 files have been successfully saved:`)
		printSuccess(`  - ${commonDst}`)
		printSuccess(`  - ${f01Dst}`)
		printSuccess(`  - ${f02Dst}`)
	}
}

// 1. Creates your first command. This example shows an 'order' command with a required argument
// called 'product' and an optional argument called 'option'.
program
	.command('compare <file01> <file02>')
	.option('-t, --trim', 'Trims rows before comparing them')
	.option('-i, --ignorecase', 'Case insensitive')
	.option('-c, --contains', 'The compare is positive if the row contains the other.')
	.description('Default behavior. Compares two files. Equivalent to `npx compare-rows`') // Optional description
	.action(main)

const cmdArgs = [process.argv[0], process.argv[1]]
if (process.argv.length == 2)
	cmdArgs.push('compare')
else {
	const [,,...args] = process.argv
	const explicitCompareCmd = args[0] == 'compare'
	const { options, files, help } = args.reduce((acc,a) => {
		if (a.help)
			return acc
		if (a == 'h' || a == 'help' || a == '-h' || a == '--help')
			acc.help = true
		else if (a.indexOf('-') == 0)
			acc.options.push(a)
		else
			acc.files.push(a)
		return acc
	}, { options:[], files:[], help:false })

	if (help) {
		if (explicitCompareCmd)
			cmdArgs.push('compare', '--help')
		else
			cmdArgs.push('help')
	} else
		cmdArgs.push('compare', ...options, ...files)
}

program.parse(cmdArgs) 



