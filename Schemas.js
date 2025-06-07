

const GetStorageSchema = () => {
    return ["id", "date", "description", "amount"]
}

const GetConfigFileSchema = () => {
    return {
        "username": "user",
        "ExpenceTableName": "expences",
        "budjet": 500,
        "CurrentTotal": 0
    }
}


export {
    GetStorageSchema,
    GetConfigFileSchema
}