#!/usr/bin/env node

import * as FilesControl from './FIlesControl.js';
import * as Helpers from './Helper.js'

// import Tasks Related to Files
const {
  PrepareRequiredFiles,
  GetNextId,
  ReadExpensesFromFile,
  AppendExpenceToFile,
  SaveAllExpenceToFile,
  ReadConfigFile
} = FilesControl;



const {
    ParseNamedArguments,
    GetCurrentMonthStringFromDateObject,
    GetMonthStringFromExpenceObject,
    GetMonthString,
    CheckMonthMached,
    ReadUserBooleanInput
} = Helpers


// Data Construction

const CreateExpenceObject = (Description, Amount) => {
    const now = new Date();
    const ExpenceObject = {
        id: GetNextId(),
        date: now.toDateString(),
        description: Description,
        amount: Amount
    };

    return ExpenceObject
};


// business logic

const NewExpenceSatisfyConfig = async (Expence) => {

    // check if expence will satisfy some conditions after it added to the Storage


    // must not exceed the budjet set by the user
    const Configs = GetConfigDate();
    const budjet = Configs.budjet;

    const now = new Date()
    const CurrentMonth = GetCurrentMonthStringFromDateObject(now)
    const CurrentTotal = await GetExpencesSummary(CurrentMonth);
    const NewTotal = CurrentTotal + parseInt(Expence.amount);

    if( NewTotal > budjet){
        console.log("it seems like this action will excessed your budjet we will add it any way.");
            const Accepted = await ReadUserBooleanInput();
            if(!Accepted)
                return false;
    }

    return true;
}

const UpdatedExpenceSatisfyConfig = async (Expence, ExpenceId) => {
     // must not exceed the budjet set by the user

    const Expences = await GetExpences() 
    const Configs = GetConfigDate();
    const budjet = Configs.budjet;
    const now = new Date()
    const CurrentMonth = GetCurrentMonthStringFromDateObject(now)
    const CurrentTotal = await GetExpencesSummary(CurrentMonth);
    const NewTotal = (CurrentTotal + (Expence.amount - Expences[ExpenceId].amount))

    if(NewTotal > budjet){
        console.log("it seems like this action will excessed your budjet we will add it any way.");
        const Accepted = await ReadUserBooleanInput();
            if(!Accepted)
                return false;
    }

    return true;
}


const AddNewExpenceObject = async (ExpenceObject) => {

    const Approved = await NewExpenceSatisfyConfig(ExpenceObject)
    if(Approved){
        await AppendExpenceToFile(ExpenceObject);
        console.log(`New Expence Added with id (${ExpenceObject.id})`);
        return true
    } else {
        console.log(`Can't Add this Expence Right Now.`);
    }
    return false;
}

const UpdateExpenceObject = async (NewDescription=null, NewAmount=null, ExpenceId) => {
    const Expences = await GetExpences();
    const ExpenceIndex = Expences.findIndex(Expence => Expence.id == (ExpenceId));

    if (NewDescription){

        Expences[ExpenceIndex].description = NewDescription;
    }
    if (NewAmount){
        if(!isNaN(NewAmount))
            Expences[ExpenceIndex].amount = NewAmount;
        else{
            console.log("amount must be valid number")
            return;
        }
    }

    const Approved = await UpdatedExpenceSatisfyConfig(Expences[ExpenceIndex], ExpenceId)
    if(Approved){
        await SaveAllExpenceToFile(Expences);
        console.log(`Expence with id ${Expences[ExpenceIndex].id} updated`);
        return true;
    }
}

const DeleteExpenceObject = async (ExpenceId) => {
    const Expences = await GetExpences();
    // console.log(Expences)
    const ExpenceIndex = Expences.findIndex(Expence => Expence.id == (ExpenceId));

    if (ExpenceIndex == -1)
        return null

    // delete the object
    const [DeletedObject] = Expences.splice(ExpenceIndex, 1);
    
    await SaveAllExpenceToFile(Expences);
    return DeletedObject;
}


// data query
const GetExpences = async (month=null) => {
    const Expences = await ReadExpensesFromFile();

    if(!month)
        return Expences;

    let SelectedExpences = [];

    Expences.forEach(Expence => {
        if(CheckMonthMached(month, GetMonthStringFromExpenceObject(Expence)))
            SelectedExpences.push(Expence)
    })

    return SelectedExpences
}

const GetExpencesSummary = async (month=null) => {
    const Expences = await ReadExpensesFromFile();

    const Total = Expences.reduce((sum, Expence) => {

        if(!month)
            return sum + parseFloat(Expence.amount)
        else {
            let Mached = CheckMonthMached(month, GetMonthStringFromExpenceObject(Expence));
            
            if (Mached)
                return sum + parseFloat(Expence.amount);
            else 
                return sum
        }
    }, 0);
    return Total
}

const GetConfigDate = () => {
    return ReadConfigFile()
}

// data representaion

const DisplayExpences = (Expences) => {
    Expences.forEach((element, ind) => {
        console.log(`${ind+1}. ${element.description} ${element.amount}.`)
    });
}

// orcistrators

const CommandsMapper = async (Command) => {
    const args = ParseNamedArguments();
    switch(Command){
        case('add'):
            if(!args.hasOwnProperty("description"))
                console.log("please provide description");
            else if (!args.hasOwnProperty("amount") || isNaN(args["amount"]) || args["amount"] < 0)
                console.log("please provide valid amount");
            else {
                const ExpenceObject = CreateExpenceObject(args["description"], args["amount"]);
                await AddNewExpenceObject(ExpenceObject);                
            }
            break;
        case("delete"):
            if(!args.hasOwnProperty("id"))
                console.log("Please Provide Expence Id.")
            else {
                await DeleteExpenceObject(args['id']);
            }
            break;
        case("list"):
            const Expences = await GetExpences();
            if (Expences.length <= 0)
                console.log("No Expences To Display");
            else 
                DisplayExpences(Expences);
            break;
        case('update'):
            if(!args.hasOwnProperty('id'))
                console.log("Provide an Id");
            else {
                if(!args.hasOwnProperty('newdescription') &&  !args.hasOwnProperty('newamount'))
                    console.log("Please Provide new Valid data please");
                else {
                    const NewDescription = args.hasOwnProperty('newdescription') ? args['newdescription']: null;
                    const NewAmount = args.hasOwnProperty('newamount') ? args['newamount']: null;
                    await UpdateExpenceObject(NewDescription, NewAmount, args['id']);
                }
            }
            break;
        case('summary'):
                if(!args.hasOwnProperty('month')){
                    const Summary = await GetExpencesSummary();
                    console.log(`Total Expences: \$${Summary}`);
                } else {
                    const Summary = await GetExpencesSummary(args['month']);
                    console.log(`Total Expences for ${GetMonthString(args['month'])} ${!isNaN(Summary) ? Summary: "Not Exist"}`);
                }

            break;
        default:
            console.log("Unknown command. Use `add` or `list`.");
            break;
    }
}

(async () => {
    try {
        const Command = process.argv[2];
        if (Command) {
            PrepareRequiredFiles();
            await CommandsMapper(Command);
        } else {
            console.log("USAGE <command> <argument>");
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
})();

