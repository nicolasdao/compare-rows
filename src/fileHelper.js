
/**
 * Copyright (c) 2017-2020, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license.
*/

const fs = require('fs')
const { resolve } = require('path')

/**
 * Gets a file under a Google Cloud Storage's 'filePath'.
 * 
 * @param  {String}  filePath     Absolute file path on the local machine
 * @return {Buffer}
 */
const readFile = filePath => new Promise((onSuccess, onFailure) => fs.readFile(resolve(filePath||''), (err, data) => err ? onFailure(err) : onSuccess(data)))


/**
 * Checks if a file or folder exists
 * 
 * @param  {String}  filePath     Absolute or relative path to file or folder on the local machine
 * @return {Boolean}   
 */
const fileExists = filePath => new Promise(onSuccess => fs.exists(resolve(filePath||''), yes => onSuccess(yes ? true : false)))

/**
 * Creates file or update file located under 'filePath'. 
 * 
 * @param  {String}  filePath             Absolute file path on the local machine
 * @param  {Object}  content             File content
 * @param  {Boolean} options.append     Default false. If true, this function appends rather than overrides.
 * @param  {String}  options.appendSep     Default '\n'. That the string used to separate appended content. This option is only
 *                                         active when 'options.append' is set to true.
 * @return {Void}                    
 */
const writeToFile = (filePath, content, options) => new Promise((onSuccess, onFailure) => {
    filePath = resolve(filePath||'')
    content = content || ''
    const { append, appendSep='\n' } = options || {}
    const stringContent = (typeof(content) == 'string' || content instanceof Buffer) ? content : JSON.stringify(content, null, '  ')
    const fn = append ? fs.appendFile : fs.writeFile
    fn(filePath, append ? `${stringContent}${appendSep}` : stringContent, err => err ? onFailure(err) : onSuccess())
})

module.exports = {
    read: readFile,
    exists: fileExists,
    write: writeToFile
}
