#!/usr/bin/env node

import * as FilesControl from './FIlesControl.js';
import * as Helpers from './Helper.js'



// functions Related to I/O on Files Tasks
const {
  PrepareRequiredFiles,
  GetNextId,
  ReadExpensesFromFile,
  AppendExpenceToFile,
  SaveAllExpenceToFile,
  ReadConfigFile
} = FilesControl;

// Helper Function Used But Not Dirctly Related to Business Logic
const {
    ParseNamedArguments,
    GetCurrentMonthIndexFromDateObject,
    GetMonthStringFromExpenceObject,
    GetMonthString,
    CheckMonthMached,
    ReadUserBooleanInput
} = Helpers



// Data Construction Tasks
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
    const CurrentMonth = GetCurrentMonthIndexFromDateObject(now)
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

    const now = new Date()

    const budjet = Configs.budjet;
    
    const CurrentMonth = GetCurrentMonthIndexFromDateObject(now)
    const CurrentTotal = await GetExpencesSummary(CurrentMonth);

    const UpdatedExpenceIndex = Expences.findIndex(Expence => Expence.id == (ExpenceId));
    const NewTotal = (CurrentTotal + (Expence.amount - parseFloat(Expences[UpdatedExpenceIndex].amount)))

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

    if(ExpenceIndex === -1){
        console.log(`Expence with ID(${ExpenceId}) does not exist.`)
        return
    }

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
    } else {
        console.log("Can't Update This Expence Right now")
    }
}

const DeleteExpenceObject = async (ExpenceId) => {
    const Expences = await GetExpences();
    const ExpenceIndex = Expences.findIndex(Expence => Expence.id == (ExpenceId));

    if(ExpenceIndex === -1){
        console.log(`Expence with ID(${ExpenceId}) does not exist.`)
        return false
    }

    // delete the object
    const DeletedExpence = Expences.splice(ExpenceIndex, 1);

    await SaveAllExpenceToFile(Expences);

    console.log(`Expence With ID(${DeletedExpence.id}) Deleted Seccessfully`)
    return true;
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

    // get the arguments passed with the command
    const args = ParseNamedArguments();

    switch(Command){
        case('add'):
            if(!args.hasOwnProperty("description"))
                console.log("Please Provide an Expence Description");
            else if (!args.hasOwnProperty("amount") || isNaN(args["amount"]) || args["amount"] < 0)
                console.log("Please Provide Valid Amount (Postive number).");
            else {
                // construct new Expence Object
                const ExpenceObject = CreateExpenceObject(args["description"], args["amount"]);

                // add the Expence to Storage
                await AddNewExpenceObject(ExpenceObject);
            }
            break;
        case("delete"):
            if(!args.hasOwnProperty("id"))
                console.log("Please Pass The Expence Id.")
            else {
                // start process of deleteing Expence with given ID
                await DeleteExpenceObject(args['id']);
            }
            break;
        case("list"):

            let Month = null;

            if(args.hasOwnProperty('month'))
                Month = args['month'];

            // Get the Expences From the Storage
            const Expences = await GetExpences(Month);

            if (Expences.length <= 0)
                console.log("No Expences To Display");
            else 
                DisplayExpences(Expences);
            break;
        case('update'):
            if(!args.hasOwnProperty('id'))
                console.log("Please Provide Expence ID");
            else {
                if(!args.hasOwnProperty('newdescription') &&  !args.hasOwnProperty('newamount'))
                    console.log("Please Provide Your New Valid Data (newdescription or newamount)");
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
            console.log("USAGE:  Expence-Cli <Command> --<ArgumentName> <ArgumentValue> ");
            break;
    }
}

(async () => {
    const Command = process.argv[2];
    if (Command) {
        PrepareRequiredFiles();
        await CommandsMapper(Command);
    } else {
        console.log("USAGE:  Expence-Cli <Command> --<ArgumentName> <ArgumentValue> ");
    }
})();

