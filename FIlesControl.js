import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as Schemas from './Schemas.js'


const {
    GetStorageSchema,
    GetConfigFileSchema
} = Schemas



const PrepareRequiredFiles = () => {
    if(!StorageFileExist())
        CreateStorageFile();

    if(!ConfigFileExist())
        CreateConfigFile();
}

const GetNextId = () => {
    if (!StorageFileExist()) return 1;
    const data = fs.readFileSync(GetStoragePath(), 'utf-8');
    const lines = data.trim().split('\n');
    if (lines.length <= 1) return 1; // Only header exists (haeder \n)
    const lastLine = lines[lines.length - 1];
    const lastId = parseInt(lastLine.split(',')[0]);
    return isNaN(lastId) ? 1 : lastId + 1;
};

const GetStoragePath = () =>{
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const FileName = "expence.csv";
    const Path = path.join(__dirname, FileName);
    return Path;
}

const GetConfigFilePath = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const FileName = "Config.json";
    const Path = path.join(__dirname, FileName);
    return Path;
}

const StorageFileExist = () => {
    return fs.existsSync(GetStoragePath());
}

const ConfigFileExist = () => {
    if(!fs.existsSync(GetConfigFilePath()))
        return false
    return true
}

const CreateStorageFile = () => {
    if(!StorageFileExist())
        fs.writeFileSync(GetStoragePath(), GetStorageSchema().join(',') + '\n');
}

const CreateConfigFile = () => {
    if(!ConfigFileExist())
        fs.writeFileSync(GetConfigFilePath(), JSON.stringify(GetConfigFileSchema(), null, 2));

}

const CsvWriterConstructor = (Append=false) => {
    const CsvWriter = createObjectCsvWriter({
    path: GetStoragePath(),
    header: [
        {id: "id", title: "id"},
        { id: 'date', title: 'date' },
        {id: "description", title:"description"},
        { id: 'amount', title: 'amount' },
    ],
    append: Append  //  enables appending instead of overwriting dynamically
    });

    return CsvWriter
}

const ReadExpensesFromFile = async () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(GetStoragePath())
      .pipe(csv())
      .on('data', (data) => results.push(
        {
        ...data
        }
      ))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

const ReadConfigFile = () => {

    const path = GetConfigFilePath();

    if (path)
        return JSON.parse(fs.readFileSync(path))
}

const AppendExpenceToFile = async (ExpenceObject) => {
    // append new expence only
    const writer =  CsvWriterConstructor(true);
    await writer.writeRecords([ExpenceObject]);
    // console.log(ExpenceObject)
    return ExpenceObject;
}

const SaveAllExpenceToFile = async (ExpencesObjects) => {
    // rewrite all expences
    const writer =  CsvWriterConstructor(false);
    await writer.writeRecords(ExpencesObjects);
}


export {
    PrepareRequiredFiles,
    GetNextId,
    GetStoragePath,
    GetConfigFilePath,
    StorageFileExist,
    ConfigFileExist,
    CreateStorageFile,
    CreateConfigFile,
    CsvWriterConstructor,
    ReadExpensesFromFile,
    AppendExpenceToFile,
    SaveAllExpenceToFile,
    ReadConfigFile
}