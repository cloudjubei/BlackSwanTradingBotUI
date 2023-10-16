import fs from 'fs'

export default class StorageUtils
{
    static checkIfFileOrDirectoryExists = (path: string) : boolean =>
    {
        return fs.existsSync(path)
    }

    static getFileAsync = async (path: string) : Promise<string> =>
    {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(data.toString())
            })
        })
    }
    static getFile = (path: string) : string =>
    {
        return fs.readFileSync(path).toString()
    }

    static createOrWriteToFileAsync = async (path: string, fileName: string, data: string) : Promise<void> =>
    {
        return new Promise((resolve, reject) => {
            const writeFile = () => {
                fs.writeFile(`${path}/${fileName}`, data, 'utf8', (err) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve()
                })
            }
            if (!StorageUtils.checkIfFileOrDirectoryExists(path)) {
                fs.mkdir(path, (err) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    writeFile()
                })
            }else{
                writeFile()
            }
        })
    }
    static createOrWriteToFile = (path: string, fileName: string, data: string) =>
    {
        if (!StorageUtils.checkIfFileOrDirectoryExists(path)) {
            fs.mkdirSync(path)
        }

        fs.writeFileSync(`${path}/${fileName}`, data, 'utf8')
    }

    static deleteFileAsync = async (path: string) : Promise<void> =>
    {
        return new Promise((resolve, reject) => {
            fs.unlink(path, (err) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
            })
        })
    }
    static deleteFile = (path: string) =>
    {
        fs.unlinkSync(path)
    }
}